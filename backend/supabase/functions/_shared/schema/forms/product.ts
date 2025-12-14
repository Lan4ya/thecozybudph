import z from "zod";

export const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(250, "name can't exceed 250 characters"),

  price: z.coerce
    .number("price is required")
    .min(0, "price can't be negative")
    .max(1000000, "price can't exceed 1,000,000"),

  // this is optional so this accepts an empty arr: []
  // what's being validated are the items inside if not empty.
  colorVariants: z.array(
    z
      .string()
      .trim()
      .min(1, "color name must contain at least 1 character")
      .max(100, "color name can't exceed 100 characters"),
  ),

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
  productImages: z
    .array(imageFileSchema)
    .min(1, "image is required")
    .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`),
  primaryImageIndex: z.coerce
    .number()
    .min(0, "primary image index is required"),
});

export const updateProductSchema = productBaseSchema.partial().extend({
  productId: z.string().min(1, "product ID is required"),
  newProductImages: z
    .array(imageFileSchema)
    .max(MAX_IMAGES, `you can upload up to ${MAX_IMAGES} images only`)
    .optional(),
  imageUrlsToDelete: z.array(z.url()).optional(),
  primaryImageIndex: z.coerce
    .number()
    .min(0, "primary image index is required")
    .optional(),
  productCollectionId: z.string().optional(),
});

export type ProductBase = z.infer<typeof productBaseSchema>;
export type CreateProductForm = z.infer<typeof createProductSchema>;
export type UpdateProductForm = z.infer<typeof updateProductSchema>;
