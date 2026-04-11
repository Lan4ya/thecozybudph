import { AppError } from "@shared/errors/Errors.ts";
import {
  DeleteProducts,
  DeleteProductsInput,
} from "@shared/package-types/index.ts";
import { isDev } from "@shared/utils/isDev.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";

export const deleteProducts = async (
  db: DrizzleClient,
  payload: DeleteProductsInput,
): Promise<DeleteProducts> => {
  const { productIds } = payload;

  const { data: products, error } = await ProductRepository.getProductsByIds(
    supabase,
    productIds,
  );

  if (error || !products) {
    throw AppError.internal();
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

  const { data, error: deleteError } =
    await ProductRepository.deleteProductsByIds(supabase, productIds);

  if (deleteError) {
    throw AppError.internal();
  }

  const deletedProductIds: string[] = data?.map((d) => String(d.id)) ?? [];
  return { deletedProductIds };
};
