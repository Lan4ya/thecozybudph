import z from "zod";
import { createProductSchema, updateProductSchema } from "../api/index.ts";

export const validateFormPrice = (
  label: string,
  numStr: string,
  ctx: z.RefinementCtx,
): number => {
  const n = Number(numStr.replace(/,/g, ""));

  if (!Number.isFinite(n)) {
    ctx.addIssue({
      code: "custom",
      message: `${label} must be a valid number`,
    });
    return z.NEVER;
  }

  if (!Number.isInteger(n)) {
    ctx.addIssue({
      code: "custom",
      message: `${label} must be a whole number`,
    });
    return z.NEVER;
  }

  if (n < 1) {
    ctx.addIssue({
      code: "custom",
      message: `${label} must be greater than 0`,
    });
    return z.NEVER;
  }

  if (n > 1_000_000) {
    ctx.addIssue({
      code: "custom",
      message: `${label} can't exceed 1,000,000`,
    });
    return z.NEVER;
  }

  return n;
};

const productFormVariantSchema = z.object({
  id: z.uuid("product variant id is not a valid UUID").optional(),
  priceCents: z
    .string()
    .trim()
    .min(1, "price can't be empty")
    .transform((v, ctx) => {
      const n = validateFormPrice("price", v, ctx);

      // convert pesos -> cents (API accepts cents)
      return n * 100;
    }),

  attributes: z.record(
    z.string().trim().nonempty(),
    z.string().trim().nonempty(),
  ),
});

const productFormOptionSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("option name is required")
    .max(255, "name can't exceed 255 characters")
    .toLowerCase(),
  values: z
    .array(z.string().trim().nonempty("option value is required").toLowerCase())
    .nonempty(),
});

export const createProductFormSchema = createProductSchema.extend({
  basePrice: z
    .string()
    .trim()
    .min(1, "base price can't be empty")
    .transform((v, ctx) => {
      const n = validateFormPrice("price", v, ctx);
      return n;
    }),
  options: z.array(productFormOptionSchema).default([]),
  variants: z
    .array(productFormVariantSchema)
    .nonempty("product variants can't be empty"),
  mode: z.literal("create"),
});

export const updateProductFormSchema = updateProductSchema.extend({
  mode: z.literal("update"),
  options: z.array(productFormOptionSchema).optional(),
  variants: z
    .array(productFormVariantSchema)
    .nonempty("product variants can't be empty")
    .optional(),
});

export const productFormSchema = z.discriminatedUnion("mode", [
  createProductFormSchema,
  updateProductFormSchema,
]);
