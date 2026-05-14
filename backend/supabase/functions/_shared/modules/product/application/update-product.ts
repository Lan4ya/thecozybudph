import {
  ProductWithRelations,
  UpdateProductInput,
  UpdateProductWithRelations,
} from "@shared/schemas/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseDB } from "@shared/types.d.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const updateProduct = async (
  db: DrizzleClient,
  supabase: SupabaseDB,
  productId: string,
  payload: UpdateProductInput,
): Promise<ProductWithRelations> => {
  const existingProduct = await ProductRepository.getProductById(db, productId);

  if (!existingProduct) throw AppError.notFound("Product not found");

  let updatedImageUrls = existingProduct.imageUrls ?? [];
  let updatedImageHashes = existingProduct.imageHashes ?? [];

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

  let uploadCleanup: (() => Promise<void>) | undefined;
  try {
    // Handle image uploads
    if (newProductImages?.length) {
      const { urls, hashes, cleanup } = await ProductStorage.uploadImages(
        supabase,
        "products",
        newProductImages,
      );

      uploadCleanup = cleanup;

      updatedImageUrls = [...updatedImageUrls, ...urls];
      updatedImageHashes = [...updatedImageHashes, ...hashes];
    }

    // Handle image deletions
    if (imageUrlsToDelete?.length) {
      const remainingUrls: string[] = [];
      const remainingHashes: string[] = [];

      updatedImageUrls.forEach((url: string, index: number) => {
        if (!payload.imageUrlsToDelete?.includes(url)) {
          remainingUrls.push(url);
          remainingHashes.push(updatedImageHashes[index]);
        }
      });

      updatedImageUrls = remainingUrls;
      updatedImageHashes = remainingHashes;

      const filePaths = imageUrlsToDelete
        .map((url: string) => url.match(/\/products\/([^?]+)/)?.[1])
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        const deleteError = await ProductStorage.deleteImages(
          supabase,
          "products",
          filePaths,
        );
        if (deleteError)
          console.error("Failed to delete some images:", deleteError);
      }
    }

    const productUpdates: UpdateProductWithRelations = {
      ...rest,
      imageUrls: updatedImageUrls,
      imageHashes: updatedImageHashes,
      primaryImageUrl: updatedImageUrls[primaryImageIndex ?? 0],
      primaryImageHash: updatedImageHashes[primaryImageIndex ?? 0],
    };

    const updatedProductWithRelations =
      await ProductRepository.updateProductWithRelations(
        db,
        productId,
        productUpdates,
      );

    return updatedProductWithRelations;
  } catch (error) {
    if (uploadCleanup) {
      await uploadCleanup().catch((err) => {
        console.error("Image cleanup failed after update error", err);
      });
    }

    throw AppError.internal("Failed to update product", { cause: error });
  }
};
