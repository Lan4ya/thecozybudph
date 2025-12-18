import {
  ProductsMetadataRow,
  UpdateProductData,
  UpdateProductRequest,
} from "@shared/schema/index.ts";
import { CustomError } from "@shared/errors/CustomError.ts";
import { SupabaseClient } from "supabase";
import { ProductRepository } from "../repository.ts";
import { ProductStorage } from "../storage.ts";

export const updateProduct = async (
  supabase: SupabaseClient,
  payload: UpdateProductRequest,
): Promise<UpdateProductData> => {
  // Check product existence
  const { data: existingProduct, error: fetchError } =
    await ProductRepository.getProductById(supabase, payload.productId);

  if (fetchError)
    throw CustomError.internal(`Failed to fetch product: ${fetchError}`);

  if (!existingProduct) throw CustomError.notFound("Product not found");

  let updatedImageUrls = existingProduct.image_urls ?? [];

  // Short circuit if finalImageCount is invalid
  const finalImageCount =
    updatedImageUrls.length -
    (payload.imageUrlsToDelete?.length ?? 0) +
    (payload.newProductImages?.length ?? 0);

  if (finalImageCount < 1)
    throw CustomError.badRequest("Product must have at least one image");
  else if (finalImageCount > 3)
    throw CustomError.badRequest("You can upload up to 3 images only");

  // Upsert category if being updated
  let productCategory: { id: string; name: string } | null = null;
  if (payload.category) {
    const { data, error: upsertCategoryError } =
      await ProductRepository.upsertCategory(supabase, payload.category);
    if (upsertCategoryError)
      throw CustomError.internal(upsertCategoryError.message);
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
    if (error) throw CustomError.internal(error.message);
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

  const dbUpdates: Partial<
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
    await ProductRepository.updateProduct(
      supabase,
      payload.productId,
      dbUpdates,
    );

  if (updateError) {
    await cleanupUploads().catch((err) => {
      console.error("Image cleanup failed after update error", err);
    });

    throw CustomError.internal(
      `Failed to update product: ${updateError.message}`,
    );
  }

  return {
    ...updatedProduct,
    productsCollection: productCollection
      ? { name: productCollection.name }
      : null,
    productsCategory: productCategory ? { name: productCategory.name } : null,
  };
};
