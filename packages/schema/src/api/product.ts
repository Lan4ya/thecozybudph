import type { ProductsMetadataRow } from "../db/product.ts";
import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";
import { createProductSchema, updateProductSchema } from "../forms/product.ts";
import z from "zod";

// REQUEST TYPES:

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type DeleteProductRequest = string;

// RESPONSE TYPES:

export type ProductData = SnakeToCamel<ProductsMetadataRow>;
export type ProductDataWithJoins = ProductData & {
  productsCollection: {
    name: string | null;
  } | null;
};
export type CreateProductData = ProductData & {
  productsCollection: {
    name: string | null;
  } | null;
};
export type UpdateProductData = ProductData & {
  productsCollection: {
    name: string | null;
  } | null;
};
export type DeleteProductData = { productId: string };
