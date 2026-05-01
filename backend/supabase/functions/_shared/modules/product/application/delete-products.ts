import { AppError } from "@shared/errors/Errors.ts";
import { DeleteProducts, DeleteProductsInput } from "@shared/schemas/index.ts";
import { isDev } from "@shared/utils/isDev.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { SupabaseType } from "../../../types.d.ts";

export const deleteProducts = async (
  db: DrizzleClient,
  supabase: SupabaseType,
  payload: DeleteProductsInput,
): Promise<DeleteProducts> => {
  const { productIds } = payload;

  const products = await ProductRepository.getProductsByIds(db, productIds);

  if (!products || products.length === 0) {
    throw AppError.notFound("Products not found");
  }

  const imageUrls = products.flatMap((p) =>
    Array.isArray(p.imageUrls) ? p.imageUrls : [],
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

        // const urlParts = new URL(url);
        // const pathAfterBucket = urlParts.pathname.split(`/storage/v1/object/public/${bucket}/`)[1];
      })
      .filter((p): p is string => p !== null);

    if (filePaths.length > 0) {
      const error = await ProductStorage.deleteImages(supabase, filePaths);
      if (error) {
        console.error("Failed to delete some images:", error);
        // Not gonna throw an err even if storage cleanup fails, instead we
        // continue with DB deletion
      }
    }
  }

  const deletedProducts = await ProductRepository.deleteProductsByIds(
    db,
    productIds,
  );

  if (deletedProducts.length === 0) {
    throw AppError.notFound("Products not found");
  }

  const deletedProductIds: string[] =
    deletedProducts.map((d) => String(d.id)) ?? [];
  return { deletedProductIds };
};
