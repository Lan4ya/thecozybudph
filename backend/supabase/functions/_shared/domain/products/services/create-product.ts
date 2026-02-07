import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";
import {
  CreateProductInput,
  ProductWithRelationResponse,
} from "@shared/types/index.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { snakeToCamel } from "../../../utils/caseConverter.ts";

export const createProduct = async (
  supabase: SupabaseType,
  payload: CreateProductInput,
): Promise<ProductWithRelationResponse> => {
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

  const dbInserts = {
    name,
    price,
    color_variants: colorVariants ?? [],
    description: description ?? null,
    image_urls: urls,
    primary_image_url: urls[primaryImageIndex ?? 0],
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
    productCollections: productCollection
      ? { name: productCollection.name }
      : null,
    productCategories: productCategory ? { name: productCategory.name } : null,
  };
};
