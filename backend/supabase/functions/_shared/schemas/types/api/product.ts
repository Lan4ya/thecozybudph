import z from "zod";
import {
  productBaseSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductsSchema,
} from "../../zod/index.ts";

export type ProductBase = z.infer<typeof productBaseSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductsInput = z.infer<typeof deleteProductsSchema>;

export type DeleteProducts = { deletedProductIds: string[] };
