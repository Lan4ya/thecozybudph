import { z } from "@hono/zod-openapi";
import { apiSuccessResponseSchema } from "./_response.ts";

// ----------------------- REQUEST SCHEMAS -----------------------

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
  })
  .openapi({ type: "string", format: "binary", "x-ts-type": "File" });

export const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(255, "name can't exceed 255 characters")
    .toLowerCase(),

  description: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z
      .string()
      .max(600, "description can't exceed 600 characters")
      .optional()
      .nullable(),
  ),

  categoryName: z
    .string()
    .trim()
    .min(1, "category is required")
    .max(100, "category can't exceed 100 characters")
    .toLowerCase(),

  collectionName: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z
      .string()
      .max(100, "collection name can't exceed 100 characters")
      .toLowerCase()
      .optional()
      .nullable(),
  ),
});

export const productOptionSchema = z.object({
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

export const productVariantSchema = z.object({
  id: z.uuid("product variant id is not a valid UUID").optional(),
  priceCents: z
    .int("price cents must be an integer")
    .positive("price cents must be greater than 0")
    .max(100_000_000, "price cents can't exceed 100,000,000"),

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

  options: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(productOptionSchema).nonempty("product options must atleast have one item"))
    .openapi({
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          values: { type: "array", items: { type: "string" } },
        },
        required: ["name", "values"],
      },
    }),

  variants: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(productVariantSchema).nonempty("product variants can't be empty"),
  ),
  // .openapi({
  //   type: "array",
  //   items: {
  //     type: "object",
  //     properties: {
  //       id: { type: "string", format: "uuid" },
  //       priceCents: { type: "number" },
  //       attributes: {
  //         type: "object",
  //         additionalProperties: { type: "string" },
  //       },
  //     },
  //     required: ["priceCents", "attributes"],
  //   },
  // }),
});

export const updateProductSchema = productBaseSchema.partial().extend({
  newProductImages: z.preprocess(
    (val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    },
    z
      .array(imageFileSchema)
      .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`)
      .default([]),
  ),

  imageUrlsToDelete: z
    .preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    }, z.array(z.url()).default([]))
    .openapi({
      type: "array",
      items: { type: "string", format: "uri" },
    }),

  primaryImageIndex: z.coerce
    .number()
    .min(0, "primaryImageIndex out of range")
    .optional(),

  options: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(productOptionSchema).default([]))
    .openapi({
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          values: { type: "array", items: { type: "string" } },
        },
        required: ["name", "values"],
      },
    }),

  variants: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(productVariantSchema).default([]),
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

// ----------------------- DATA SCHEMAS -----------------------

export const productDataSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrls: z.array(z.url()),
  primaryImageUrl: z.url(),
  minPriceCents: z.number(),
  maxPriceCents: z.number(),
  options: z.array(productOptionSchema),
  variants: z.array(productVariantSchema.extend({ id: z.uuid() })),
  categoryName: z.string().nullable(),
  collectionName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const deleteProductsDataSchema = z.object({
  deletedProductIds: z.array(z.uuid()),
});

// ----------------------- RESPONSE SCHEMAS -----------------------

export const createProductResponseSchema =
  apiSuccessResponseSchema(productDataSchema);

export const updateProductResponseSchema =
  apiSuccessResponseSchema(productDataSchema);

export const deleteProductsResponseSchema = apiSuccessResponseSchema(
  deleteProductsDataSchema,
);
