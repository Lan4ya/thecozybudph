import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseDB } from "@shared/types.d.ts";
import {
  CreateProductInput,
  InsertProductWithRelations,
  ProductWithRelations,
} from "@shared/schemas/index.ts";
import { ProductRepository } from "../product-repository.ts";
import { ProductStorage } from "../product-storage.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const createProduct = async (
  db: DrizzleClient,
  supabaseService: SupabaseDB,
  payload: CreateProductInput,
): Promise<ProductWithRelations> => {
  const { primaryImageIndex, productImages, ...rest } = payload;

  let uploadCleanup: (() => Promise<void>) | undefined;

  try {
    // Upload images
    const { urls, hashes, cleanup } = await ProductStorage.uploadImages(
      supabaseService,
      "products",
      productImages,
    );

    uploadCleanup = cleanup;

    // Calculate min/max price
    const prices = payload.variants.map((v) => v.priceCents);
    const minPriceCents = Math.min(...prices);
    const maxPriceCents = Math.max(...prices);

    const productInserts: InsertProductWithRelations = {
      ...rest,
      imageUrls: urls,
      imageHashes: hashes,
      primaryImageUrl: urls[primaryImageIndex],
      primaryImageHash: hashes[primaryImageIndex],
      minPriceCents,
      maxPriceCents,
    };

    return await ProductRepository.insertProductWithRelations(
      db,
      productInserts,
    );
  } catch (error) {
    // Delete uploaded images if createProduct fails
    if (uploadCleanup) {
      await uploadCleanup().catch((err) => {
        console.error("Image cleanup failed after insert error", err);
      });
    }

    const msg = error instanceof AppError ? error.message : error;
    throw AppError.internal("Failed to create product", { cause: msg });
  }
};
