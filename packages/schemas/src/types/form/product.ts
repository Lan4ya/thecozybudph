import { z } from "zod";
import {
  createProductFormSchema,
  productFormSchema,
  updateProductFormSchema,
} from "../../zod/index.ts";

export type CreateProductFormInput = z.infer<typeof createProductFormSchema>;
export type UpdateProductFormInput = z.infer<typeof updateProductFormSchema>;

export type ProductFormInput = z.infer<typeof productFormSchema>;
