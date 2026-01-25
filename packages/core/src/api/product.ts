import type { Product } from "../domain/product.ts";

export type CreateProductResponse = Product;
export type UpdateProductResponse = Product;
export type DeleteProductResponse = { deletedProductIds: string[] };
