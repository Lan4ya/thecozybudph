import { z } from "zod";
import { coerceNumber } from "../utils.ts";
import { createProductSchema, updateProductSchema } from "../../zod/index.ts";

const createProductFormSchema = createProductSchema.extend({
  basePrice: coerceNumber(
    z
      .number("base price is required")
      .nonnegative("price can't be negative")
      .max(1_000_000, "price can't exceed 1,000,000"),
  ),
  mode: z.literal("create"),
});

const updateProductFormSchema = updateProductSchema.extend({
  mode: z.literal("update"),
});

export const productFormSchema = z.discriminatedUnion("mode", [
  createProductFormSchema,
  updateProductFormSchema,
]);

export type CreateProductFormInput = z.infer<typeof createProductFormSchema>;
export type UpdateProductFormInput = z.infer<typeof updateProductFormSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
