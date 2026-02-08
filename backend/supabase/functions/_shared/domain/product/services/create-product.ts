import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";
import {
  CreateProductInput,
  ProductWithRelations,
} from "@shared/types/index.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { snakeToCamel } from "../../../utils/caseConverter.ts";

export const createProduct = async (
  supabase: SupabaseType,
  payload: CreateProductInput,
): Promise<ProductWithRelations> => {
  const {
    name,
    price,
    colorVariants,
    description,
    productImages,
    primaryImageIndex,
    collectionName,
    category,
  } = payload;

  // Upsert category
  const { data: productCategory, error: upsertCategoryError } =
    await ProductRepository.upsertCategory(supabase, category);

  if (upsertCategoryError) throw AppError.internal(upsertCategoryError.message);

  // Upsert collection (optional)
  let productCollection = null;
  if (collectionName) {
    const { data, error } = await ProductRepository.upsertCollection(
      supabase,
      collectionName,
    );
    if (error)
      throw AppError.internal(`Failed to upsert collection: ${error.message}`);
    productCollection = data;
  }

  // Upload images
  const { urls, cleanup } = await ProductStorage.uploadImages(
    supabase,
    "products",
    productImages,
  );

  // const localImageUrls = urls.map((u) => u.replace("kong", "localhost"));
  // const localPrimaryImageUrls = localImageUrls[primaryImageIndex];

  const dbInserts = {
    name,
    price,
    color_variants: colorVariants ?? [],
    description: description ?? null,
    // image_urls: isDev ? localImageUrls : urls,
    // primary_image_url: isDev ? localPrimaryImageUrls : urls[primaryImageIndex],
    image_urls: urls,
    primary_image_url: urls[primaryImageIndex],
    product_collection_id: productCollection?.id ?? null,
    product_category_id: productCategory?.id ?? null,
  };

  const { data: createdProduct, error: insertError } =
    await ProductRepository.insertProduct(supabase, dbInserts);

  if (insertError) {
    await cleanup().catch((err) => {
      console.error("Image cleanup failed after insert error", err);
    });

    throw AppError.internal(`Failed to insert product: ${insertError.message}`);
  }

  if (!createdProduct) {
    throw AppError.internal(
      "Invariant Violation: product insert returned null data",
    );
  }

  const product = snakeToCamel(createdProduct);

  return {
    ...product,
    collectionName: productCollection ? productCollection.name : null,
    categoryName: productCategory ? productCategory.name : null,
  };
};
