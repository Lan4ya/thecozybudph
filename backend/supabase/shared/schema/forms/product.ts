import { z } from "zod";
import { productBaseSchema } from "../domain/product.ts";

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

export type CreateProductForm = z.infer<typeof createProductSchema>;
export type UpdateProductForm = z.infer<typeof updateProductSchema>;
