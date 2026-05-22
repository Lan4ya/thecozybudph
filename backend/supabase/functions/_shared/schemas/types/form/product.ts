import { z } from "zod";
import type {
  createProductFormSchema,
  updateProductFormSchema,
  productFormSchema,
} from "../../zod/index.ts";

export type CreateProductFormInput = z.input<typeof createProductFormSchema>;
export type CreateProductFormOutput = z.output<typeof createProductFormSchema>;

export type UpdateProductFormInput = z.input<typeof updateProductFormSchema>;
export type UpdateProductFormOutput = z.output<typeof updateProductFormSchema>;

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
