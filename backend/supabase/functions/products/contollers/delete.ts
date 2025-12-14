import { Context } from "hono";
import { SupabaseClient } from "supabase";
import { CustomError } from "@shared/errors/mod.ts";
import { isDev, handleSuccess } from "@shared/utils/mod.ts";
import {
  DeleteProductData,
  DeleteProductRequest,
} from "@shared/schema/index.ts";

export const deleteProducts = async (supabase: SupabaseClient, c: Context) => {
  const { productIds } = (await c.req.json()) as DeleteProductRequest;

  if (productIds.length === 0) {
    throw CustomError.badRequest("Product ID is required");
  }

  const { data: products, error } = await supabase
    .from("products_metadata")
    .select("id, image_urls")
    .in("id", productIds);

  if (error) {
    throw CustomError.internal(`Failed to delete product: ${error.message}`);
  }

  const imageUrls = products.flatMap((p) =>
    Array.isArray(p.image_urls) ? p.image_urls : [],
  );

  // Delete images from storage
  if (imageUrls && imageUrls.length) {
    const filePaths = imageUrls
      .map((url: string) => {
        const match = url.match(/\/products\/([^?]+)/);

        if (isDev) {
          console.log("Original URL:", url);
          console.log("Matched file path:", match);
        }

        // grab the first capture group which is the file path
        return match ? match[1] : null;
      })
      .filter((p): p is string => p !== null);

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("products")
        .remove(filePaths); // batch delete

      if (storageError) {
        console.error("Failed to delete some images:", storageError);
        // Not gonna throw an err even if storage cleanup fails, instead we continue with DB deletion
      }
    }
  }

  // Delete product from database
  const { data: deletedRows, error: deleteError } = await supabase
    .from("products_metadata")
    .delete()
    .in("id", productIds)
    .select("id");

  if (deleteError) {
    throw CustomError.internal(
      `Failed to delete product: ${deleteError.message}`,
    );
  }

  const deletedIds: DeleteProductData = deletedRows.map((r) => r.id) ?? [];
  return handleSuccess({ deletedIds });
};
