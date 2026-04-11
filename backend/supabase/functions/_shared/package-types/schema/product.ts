import z from "zod";
import { coerceNumber } from "../utils.ts";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_IMAGES = 3;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "only png, jpeg, and webp files are allowed",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "image must be under 50MB",
  });

export const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(255, "name can't exceed 255 characters"),

  description: z
    .string()
    .trim()
    .max(600, "description can't exceed 600 characters")
    .optional()
    .nullable(),

  categoryName: z
    .string()
    .trim()
    .min(1, "category is required")
    .max(100, "category can't exceed 100 characters"),

  collectionName: z
    .string()
    .trim()
    .max(100, "collection name can't exceed 100 characters")
    .optional()
    .nullable(),

  options: z.preprocess(
    (val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    },
    z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .nonempty("option name is required")
            .max(255, "name can't exceed 255 characters"),
          values: z
            .array(z.string().trim().nonempty("option value is required"))
            .nonempty(),
        }),
      )
      .default([]),
  ),
});

export const productVariantSchema = z.object({
  id: z.uuid("product variant id is not a valid UUID").optional(),
  priceCents: coerceNumber(
    z
      .number("price must be a number")
      .nonnegative("price can't be negative")
      .max(100_000_000, "price can't exceed 1,000,000"),
  ),

  attributes: z.record(
    z.string().trim().nonempty(),
    z.string().trim().nonempty(),
  ),
});

export const createProductSchema = productBaseSchema.extend({
  productImages: z.preprocess(
    (val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    },
    z
      .array(imageFileSchema)
      .min(1, "you must upload at least 1 image")
      .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`),
  ),

  primaryImageIndex: z.coerce.number().min(0, "primaryImageIndex out of range"),

  variants: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(productVariantSchema).nonempty("product variants can't be empty"),
  ),
});

export const updateProductSchema = productBaseSchema.partial().extend({
  newProductImages: z
    .array(imageFileSchema)
    .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`)
    .optional(),

  imageUrlsToDelete: z.array(z.url()).optional(),

  primaryImageIndex: z.coerce
    .number()
    .min(0, "primaryImageIndex out of range")
    .optional(),

  variants: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z
      .array(productVariantSchema)
      .nonempty("product variants can't be empty")
      .optional(),
  ),
});

export const deleteProductsSchema = z.object({
  productIds: z
    .array(z.uuid("one or more productIds have an invalid UUID"))
    .min(1, "at least one productId is required"),
});

export const productIdSchema = z.object({
  id: z.uuid("productId is not a valid UUID"),
});

export type ProductBase = z.infer<typeof productBaseSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductsInput = z.infer<typeof deleteProductsSchema>;

// ---------------------------------------------------

// PRODUCT FORM

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
