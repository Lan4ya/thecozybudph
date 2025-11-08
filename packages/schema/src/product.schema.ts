import z from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only .png, .jpg, and .webp files are allowed",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Image must be under 20MB",
  });

// --- Base Product Schema ---
const productBaseSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),

  price: z
    .number("Price must be a valid number")
    .min(0, "Price can't be negative")
    .transform((val) => Number(val.toFixed(2)))
    .refine((val) => !isNaN(val), "Invalid number"),

  color_variants: z
    .array(z.string().trim().min(1, "Color cannot be empty"))
    .optional(),

  collection_name: z.string().trim().optional(),

  description: z
    .string()
    .trim()
    .max(600, "Description must be 600 characters or less")
    .optional(),
});

export type ProductBase = z.infer<typeof productBaseSchema>;

// --- product_metadata Database Table Entity ---
export type ProductMetadata = Omit<ProductBase, "collection_name"> & {
  id: string;
  created_at: string;
  updated_at: string;
  image_urls: string[];
  primary_image_url: string;
  product_collection_id: number | null;
};

// ----------- ADMIN ONLY!!! ----------- //

export const createProductSchema = productBaseSchema.extend({
  product_images: z
    .array(imageFileSchema)
    .min(1, "product image is required")
    .max(2, "You can upload up to 2 images only"),
  primary_image_index: z.number("Primary image index must be a number"),
});

export const updateProductSchema = productBaseSchema.partial().extend({
  product_id: z.string("Product ID is required"),
  new_product_images: z.array(imageFileSchema).optional(),
  image_urls_to_delete: z.array(z.string()).optional(),
  primary_image_index: z.number("Primary image index must be a number"),
});

// Shared Types for BE and FE
export type NewProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

// ----------- ADMIN ONLY!!! ----------- //
