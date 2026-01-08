import type {
  ProductCategoriesRow,
  ProductCollectionsRow,
  ProductsMetadataRow,
} from "../db/product.ts";
import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";
import {
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
} from "../forms/product.ts";
import z from "zod";

// REQUEST TYPES:

export const productIdSchema = z.object({ id: z.uuid("invalid product id") });

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type DeleteProductsRequest = z.infer<typeof deleteProductSchema>;

// RESPONSE TYPES:

export type ProductData = SnakeToCamel<ProductsMetadataRow>;

export type ProductsCollectionData = SnakeToCamel<ProductCollectionsRow>;

export type ProductsCategoryData = SnakeToCamel<ProductCategoriesRow>;

type ProductCategoryName = Pick<ProductCategoriesRow, "name">;

type ProductCollectionName = Pick<ProductCollectionsRow, "name">;

type ProductCategoryAndCollectionName = {
  productCollections: ProductCategoryName | null;
  productCategories: ProductCollectionName | null;
};

export type ProductDataWithJoins = ProductData &
  ProductCategoryAndCollectionName;

export type CreateProductData = ProductData & ProductCategoryAndCollectionName;

export type UpdateProductData = ProductData & ProductCategoryAndCollectionName;

export type DeleteProductData = { deletedProductIds: string[] };
