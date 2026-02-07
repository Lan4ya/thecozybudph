import z from "zod";
import { coerceNumber } from "../utils/coerceNumber.ts";

export const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(250, "name can't exceed 250 characters"),

  price: coerceNumber(
    z
      .number("price must be a number")
      .nonnegative("price can't be negative")
      .max(1_000_000, "price can't exceed 1,000,000"),
  ),

  colorVariants: z
    .preprocess(
      (val) => {
        if (typeof val === "string") return [val];
        if (Array.isArray(val)) return val;
        return [];
      },
      z.array(
        z
          .string()
          .trim()
          .min(1, "color name must contain at least 1 character")
          .max(100, "color name can't exceed 100 characters"),
      ),
    )
    .default([]),

  category: z
    .string()
    .trim()
    .min(1, "category is required")
    .max(100, "category can't exceed 100 characters"),

  collectionName: z
    .string()
    .trim()
    .max(100, "collection name can't exceed 100 characters")
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(600, "description can't exceed 600 characters")
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .nullable(),
});

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

export const createProductSchema = productBaseSchema.extend({
  productImages: z.preprocess(
    (val) => {
      if (val instanceof File) return [val];
      if (Array.isArray(val)) return val;
      return [];
    },
    z
      .array(imageFileSchema)
      .min(1, "you must upload at least 1 image")
      .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`),
  ),
  primaryImageIndex: z.coerce.number().min(0, "primaryImageIndex out of range"),
});

export const updateProductSchema = productBaseSchema.partial().extend({
  newProductImages: z.preprocess(
    (val) => {
      if (val instanceof File) return [val];
      if (Array.isArray(val)) return val;
      return [];
    },
    z
      .array(imageFileSchema)
      .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`),
  ),

  imageUrlsToDelete: z.array(z.url()).optional(),

  primaryImageIndex: z.coerce
    .number()
    .min(0, "primaryImageIndex out of range")
    .optional(),

  productCollectionId: z.string().optional(),
});

export const deleteProductsSchema = z.object({
  productIds: z
    .array(z.uuid("product ID must be a valid UUID"))
    .min(1, "product Ids array can't be empty"),
});

export const productIdSchema = z.object({
  id: z.uuid("product id is not valid"),
});

export type ProductBase = z.infer<typeof productBaseSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductsInput = z.infer<typeof deleteProductsSchema>;
