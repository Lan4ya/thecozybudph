import z from "zod";

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
  });

export const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(255, "name can't exceed 255 characters")
    .toLowerCase(),

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
    .max(100, "category can't exceed 100 characters")
    .toLowerCase(),

  collectionName: z
    .string()
    .trim()
    .max(100, "collection name can't exceed 100 characters")
    .toLowerCase()
    .optional()
    .nullable(),
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

  options: z.preprocess((val) => {
    if (typeof val === "string") return JSON.parse(val);
    return val;
  }, z.array(productOptionSchema).nonempty("product options must atleast have one item")),

  variants: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(productVariantSchema).nonempty("product variants can't be empty"),
  ),
});

export const updateProductSchema = productBaseSchema.partial().extend({
  newProductImages: z.preprocess(
    (val) => {
      if (val === undefined) return undefined;
      return Array.isArray(val) ? val : [val];
    },
    z
      .array(imageFileSchema)
      .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`)
      .optional(),
  ),

  imageUrlsToDelete: z.preprocess((val) => {
    if (val === undefined) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(z.url()).optional()),

  primaryImageIndex: z.coerce
    .number()
    .min(0, "primaryImageIndex out of range")
    .optional(),

  options: z.preprocess((val) => {
    if (typeof val === "string") return JSON.parse(val);
    return val;
  }, z.array(productOptionSchema).default([])),

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
