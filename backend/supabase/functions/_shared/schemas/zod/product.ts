import { z } from "@hono/zod-openapi";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_IMAGES = 3;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Product API Schemas

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "only png, jpeg, and webp files are allowed",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "image must be under 50MB",
  })
  .openapi({ type: "string", format: "binary" });

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
  ).openapi({
    type: "string",
  }),

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
  ).openapi({
    type: "string",
  }),
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
  ).openapi({
    type: "array",
    items: { type: "string", format: "binary" },
  }),

  primaryImageIndex: z.coerce
    .number()
    .min(0, "primaryImageIndex out of range")
    .openapi({ type: "number", minimum: 0 }),

  options: z.preprocess((val) => {
    if (typeof val === "string") return JSON.parse(val);
    return val;
  }, z.array(productOptionSchema).nonempty("product options must atleast have one item")).openapi({
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
  ).openapi({
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        priceCents: { type: "number" },
        attributes: {
          type: "object",
          additionalProperties: { type: "string" },
        },
      },
      required: ["priceCents", "attributes"],
    },
  }),
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
  ).openapi({
    type: "array",
    items: { type: "string", format: "binary" },
  }),

  imageUrlsToDelete: z.preprocess((val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }, z.array(z.url()).default([])).openapi({
    type: "array",
    items: { type: "string", format: "uri" },
  }),

  primaryImageIndex: z.coerce
    .number()
    .min(0, "primaryImageIndex out of range")
    .optional(),

  options: z.preprocess((val) => {
    if (typeof val === "string") return JSON.parse(val);
    return val;
  }, z.array(productOptionSchema).default([])).openapi({
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
  ).openapi({
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        priceCents: { type: "number" },
        attributes: {
          type: "object",
          additionalProperties: { type: "string" },
        },
      },
      required: ["priceCents", "attributes"],
    },
  }),
});

export const deleteProductsSchema = z.object({
  productIds: z
    .array(z.uuid("one or more productIds have an invalid UUID"))
    .min(1, "at least one productId is required"),
});

export const productIdSchema = z.object({
  id: z.uuid("productId is not a valid UUID"),
});

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrls: z.array(z.string().url()),
  primaryImageUrl: z.string().url(),
  minPriceCents: z.number(),
  maxPriceCents: z.number(),
  options: z.array(productOptionSchema),
  variants: z.array(productVariantSchema.extend({ id: z.string().uuid() })),
  categoryName: z.string().nullable(),
  collectionName: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createProductResponseSchema = z.object({
  data: productSchema,
});

export const updateProductResponseSchema = z.object({
  data: productSchema,
});

export const deleteProductsResponseSchema = z.object({
  data: z.object({
    deletedProductIds: z.array(z.string().uuid()),
  }),
});

// -----------------------------------------------------------------------------

// Product Form Schemas

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
