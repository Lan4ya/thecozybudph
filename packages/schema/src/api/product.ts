import type {
  ProductCategoriesRow,
  ProductCollectionsRow,
  ProductsMetadataRow,
} from "../db/product.ts";
import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";
import { createProductSchema, updateProductSchema } from "../forms/product.ts";
import z from "zod";

// REQUEST TYPES:

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type DeleteProductRequest = { productIds: string[] };

// RESPONSE TYPES:

export type ProductData = SnakeToCamel<ProductsMetadataRow>;

export type ProductDataWithJoins = ProductData & {
  productCollection: {
    name: string;
  } | null;

  productCategory: {
    name: string;
  } | null;
};

export type CreateProductData = ProductData & {
  productCollection: {
    name: string;
  } | null;

  productCategory: {
    name: string;
  } | null;
};
export type UpdateProductData = ProductData & {
  productCollection: {
    name: string;
  } | null;

  productCategory: {
    name: string;
  } | null;
};
export type DeleteProductData = string[];

export type ProductsCollectionData = SnakeToCamel<ProductCollectionsRow>;
export type ProductsCategoryData = SnakeToCamel<ProductCategoriesRow>;
