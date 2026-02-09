import {
  ProductsMetadataRow,
  ProductWithRelations,
  UpdateProductInput,
} from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { snakeToCamel } from "@shared/utils/caseConverter.ts";

export const updateProduct = async (
  supabase: SupabaseType,
  productId: string,
  payload: UpdateProductInput,
): Promise<ProductWithRelations> => {
  // Check product existence
  const { data: existingProduct, error: fetchError } =
    await ProductRepository.getProductById(supabase, productId);

  if (fetchError) throw AppError.internal();

  if (!existingProduct) throw AppError.notFound("Product not found");

  let updatedImageUrls = existingProduct.image_urls ?? [];

  // Short circuit if finalImageCount is invalid
  const finalImageCount =
    updatedImageUrls.length -
    (payload.imageUrlsToDelete?.length ?? 0) +
    (payload.newProductImages?.length ?? 0);

  if (finalImageCount < 1)
    throw AppError.badRequest("Product must have at least one image");
  else if (finalImageCount > 3)
    throw AppError.badRequest("You can upload up to 3 images only");

  // Upsert category if being updated
  let productCategory: { id: string; name: string } | null = null;
  if (payload.category) {
    const { data, error: upsertCategoryError } =
      await ProductRepository.upsertCategory(supabase, payload.category);
    if (upsertCategoryError)
      throw AppError.internal(upsertCategoryError.message);
    productCategory = data;
  }

  // Upsert collection if being updated
  let productCollection: { id: string; name: string } | null = null;
  if (!payload.collectionName) {
    productCollection = null;
  } else {
    const { data, error } = await ProductRepository.upsertCollection(
      supabase,
      payload.collectionName,
    );
    if (error) throw AppError.internal();
    productCollection = data;
  }

  // Handle image uploads
  let cleanupUploads = async () => {};
  if (payload.newProductImages?.length) {
    const { urls, cleanup } = await ProductStorage.uploadImages(
      supabase,
      "products",
      payload.newProductImages,
    );
    updatedImageUrls = [...updatedImageUrls, ...urls];
    cleanupUploads = async () => {
      await cleanup();
    };
  }

  // Handle image deletions
  if (payload.imageUrlsToDelete?.length) {
    updatedImageUrls = updatedImageUrls.filter(
      (url: string) => !payload.imageUrlsToDelete!.includes(url),
    );

    const filePaths = payload.imageUrlsToDelete
      .map((url: string) => url.match(/\/products\/([^?]+)/)?.[1])
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      const deleteError = ProductStorage.deleteImages(supabase, filePaths);
      if (deleteError)
        console.error("Failed to delete some images:", deleteError);
    }
  }

  const productUpdates: Partial<
    Omit<ProductsMetadataRow, "created_at" | "updated_at" | "id">
  > = {
    name: payload.name ?? existingProduct.name,
    price: payload.price ?? 0,
    color_variants: payload.colorVariants ?? [],
    description: payload.description ?? null,
    product_collection_id: productCollection?.id ?? null,
    product_category_id: productCategory?.id ?? null,
    image_urls: updatedImageUrls,
    primary_image_url: updatedImageUrls[payload.primaryImageIndex ?? 0],
  };

  const { data: updatedProduct, error: updateError } =
    await ProductRepository.updateProduct(supabase, productId, productUpdates);

  if (updateError || !updatedProduct) {
    await cleanupUploads().catch((err) => {
      console.error("Image cleanup failed after update error", err);
    });

    throw AppError.internal();
  }

  if (!updatedProduct) {
    throw AppError.internal(
      "Invariant Violation: product update returned null data",
    );
  }

  const product = snakeToCamel(updatedProduct);

  return {
    ...product,
    collectionName: productCollection ? productCollection.name : null,
    categoryName: productCategory ? productCategory.name : null,
  };
};
