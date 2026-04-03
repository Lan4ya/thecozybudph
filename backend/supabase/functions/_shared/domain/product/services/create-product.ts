import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";
import {
  CreateProductInput,
  ProductWithRelations,
} from "@shared/types/index.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { InsertProductWithRelations } from "../../../db/types/products.ts";

export const createProduct = async (
  db: DrizzleClient,
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

  const productInserts: InsertProductWithRelations = {
    ...rest,
    imageUrls: urls,
    primaryImageUrl: urls[primaryImageIndex],
    minPriceCents,
    maxPriceCents,
  };

  try {
    const createdProductWithRelations =
      await ProductRepository.insertProductWithRelations(db, productInserts);

    return createdProductWithRelations;
  } catch (error) {
    // Delete uploaded images if createProduct fails
    await cleanup().catch((err) => {
      console.error("Image cleanup failed after insert error", err);
    });

    const msg = error instanceof AppError ? error.message : error;
    throw AppError.internal("Failed to create product", { cause: msg });
  }
};
