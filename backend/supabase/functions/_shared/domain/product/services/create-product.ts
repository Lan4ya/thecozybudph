import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";
import {
  CreateProductDBInput,
  CreateProductInput,
  ProductWithRelations,
} from "@shared/types/index.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";

export const createProduct = async (
  supabase: SupabaseType,
  payload: CreateProductInput,
): Promise<ProductWithRelations> => {
  const { primaryImageIndex, productImages, ...rest } = payload;

  // Upload images
  const { urls, cleanup } = await ProductStorage.uploadImages(
    supabase,
    "products", // bucket name
    productImages,
  );

  // Calculate min/max price
  const prices = payload.variants.map((v) => v.priceCents);
  const minPriceCents = Math.min(...prices);
  const maxPriceCents = Math.max(...prices);

  const dbInserts: CreateProductDBInput = {
    ...rest,
    description: rest.description ?? null,
    imageUrls: urls,
    primaryImageUrl: urls[primaryImageIndex],
    collectionName: rest.collectionName ?? null,
    categoryName: payload.categoryName ?? null,
    minPriceCents,
    maxPriceCents,
  };

  let createdProductWithRelations;
  try {
    createdProductWithRelations =
      await ProductRepository.createProduct(dbInserts);
  } catch (error) {
    // Delete uploaded imgages if createProduct fails
    await cleanup().catch((err) => {
      console.error("Image cleanup failed after insert error", err);
    });

    const msg = error instanceof AppError ? error.message : error;
    throw AppError.internal("Failed to create product", { cause: msg });
  }

  return createdProductWithRelations;
};
