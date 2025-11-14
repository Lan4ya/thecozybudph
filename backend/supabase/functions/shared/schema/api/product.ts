import type { ProductDB } from "../db/product.ts";
import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";
import { createProductSchema, updateProductSchema } from "../forms/product.ts";
import z from "zod";

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type DeleteProductRequest = { productId: string };

export type CreateProductData = SnakeToCamel<ProductDB>;
export type UpdateProductData = SnakeToCamel<ProductDB>;
export type DeleteProductData = { productId: string };
export type ProductData = SnakeToCamel<
  ProductDB & {
    products_collection: { name: string } | null;
  }
>;
