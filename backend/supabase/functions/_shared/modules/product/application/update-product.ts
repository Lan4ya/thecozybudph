import {
  ProductWithRelations,
  UpdateProductInput,
  UpdateProductWithRelations,
} from "@shared/schemas/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const updateProduct = async (
  db: DrizzleClient,
  supabase: SupabaseType,
  productId: string,
  payload: UpdateProductInput,
): Promise<ProductWithRelations> => {
  const existingProduct = await ProductRepository.getProductById(db, productId);

  if (!existingProduct) throw AppError.notFound("Product not found");

  let updatedImageUrls = existingProduct.imageUrls ?? [];

  // Guard on final image count
  const finalImageCount =
    updatedImageUrls.length -
    (payload.imageUrlsToDelete?.length ?? 0) +
    (payload.newProductImages?.length ?? 0);

  if (finalImageCount < 1)
    throw AppError.badRequest("Product must have at least one image");
  else if (finalImageCount > 3)
    throw AppError.badRequest("You can only upload up to 3 images");

  const { primaryImageIndex, imageUrlsToDelete, newProductImages, ...rest } =
    payload;

  // Handle image uploads
  let cleanupUploads = async () => {};
  if (newProductImages?.length) {
    const { urls, cleanup } = await ProductStorage.uploadImages(
      supabase,
      "products",
      newProductImages,
    );
    updatedImageUrls = [...updatedImageUrls, ...urls];
    cleanupUploads = async () => {
      await cleanup();
    };
  }

  // Handle image deletions
  if (imageUrlsToDelete?.length) {
    updatedImageUrls = updatedImageUrls.filter(
      (url: string) => !payload.imageUrlsToDelete!.includes(url),
    );

    const filePaths = imageUrlsToDelete
      .map((url: string) => url.match(/\/products\/([^?]+)/)?.[1])
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      const deleteError = await ProductStorage.deleteImages(
        supabase,
        filePaths,
      );
      if (deleteError)
        console.error("Failed to delete some images:", deleteError);
    }
  }

  const productUpdates: UpdateProductWithRelations = {
    ...rest,
    imageUrls: updatedImageUrls,
    primaryImageUrl: updatedImageUrls[primaryImageIndex ?? 0],
  };

  try {
    const updatedProductWithRelations =
      await ProductRepository.updateProductWithRelations(
        db,
        productId,
        productUpdates,
      );

    return updatedProductWithRelations;
  } catch (error) {
    await cleanupUploads().catch((err) => {
      console.error("Image cleanup failed after update error", err);
    });

    throw AppError.internal("Failed to update product", { cause: error });
  }
};
