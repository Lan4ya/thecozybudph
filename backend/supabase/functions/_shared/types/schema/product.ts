import z from "zod";
import { coerceNumber } from "../utils/coerce.ts";

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

  // Product option: what customers can choose from when checking out a product
  // e.g. [{name: "Color", values: ["Red", "Green"], {name: "Stem Count", values: ["6", "12"]}]
  options: z.preprocess(
    (val) => {
      if (typeof val === "string") return JSON.parse(val);
      return [];
    },

    z
      .array(
        z.object({
          name: z.string().trim().nonempty(),
          values: z.array(z.string().trim().nonempty()).nonempty(),
        }),
      )
      .default([]),
  ),

  /* Product variants: all possible combinations of product options
  e.g.:
     variants: [
       { 
          price_cents: 50_000
          options: [
          {"Color": "Red"}
          {"Stem Count": "6"}
        }, 
       { 
          price_cents: 100_000 // double the price since this flower has double the Stem Count.
          options: [
          {"Color": "Red"}
          {"Stem Count": "12"}
        } 
     ]
  */
  variants: z.preprocess(
    (val) => {
      if (typeof val === "string") return JSON.parse(val);
      return [];
    },
    z
      .array(
        z.object({
          sku: z.string().trim().toLowerCase().nonempty(),
          priceCents: coerceNumber(
            z
              .number("price must be a number")
              .nonnegative("price can't be negative")
              .max(100_000_000, "price can't exceed 1,000,000"), // err message is converted to 1M (Peso) since it'll be displayed in UI.
          ),
          options: z.record(
            z.string().trim().nonempty(),
            z.string().trim().nonempty(),
          ),
        }),
      )
      .nonempty("prooduct variant can't be empty"),
  ),
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

export const createProductSchema = productBaseSchema
  .extend({
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

    primaryImageIndex: z.coerce
      .number()
      .min(0, "primaryImageIndex out of range"),
  })
  .superRefine((data, ctx) => {
    const seen = new Map<string, number>();

    // Ensure unique sku's
    data.variants.forEach((variant, index) => {
      const sku = variant.sku;

      if (seen.has(sku)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate SKU: ${sku}`,
          path: ["variants", index, "sku"],
        });
      } else {
        seen.set(sku, index);
      }
    });
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

  // productCollectionId: z.string().optional(),
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
