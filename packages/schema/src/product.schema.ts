import z from "zod";
//
// const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
// const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
//
// export const imageFileSchema = z
//   .instanceof(File)
//   .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
//     message: "Only .png, .jpg, and .webp files are allowed",
//   })
//   .refine((file) => file.size <= MAX_FILE_SIZE, {
//     message: "Image must be under 20MB",
//   });
//
// const baseProductSchema = z.object({
//   name: z.string().trim().min(1, "Name is required"),
//   price: z.preprocess(
//     (v) => Number(v),
//     z.number().positive("Price must be > 0"),
//   ),
//   collection_name: z.string().trim().optional(),
//   description: z.string().trim().max(600, "Max 600 characters").optional(),
//   color_variants: z.array(z.string().trim()).optional(),
//   primary_image_url: z
//     .url({ message: "Invalid image URL" })
//     .optional()
//     .nullable(),
// });
//
// export const createProductSchema = baseProductSchema.extend({
//   product_images: z
//     .array(imageFileSchema)
//     .min(1, "At least one image required")
//     .max(2, "You can upload up to 2 images"),
// });
//
// export const updateProductSchema = baseProductSchema.extend({
//   product_id: z.string(),
//   new_product_images: z.array(imageFileSchema).max(2).optional(),
//   image_urls_to_delete: z.array(z.url()).optional(),
// });
//
// export type NewProduct = z.infer<typeof createProductSchema>;
// export type UpdateProduct = z.infer<typeof updateProductSchema>;
//

// --- Base Model ---
const productBaseSchema = z.object({
  name: z.string().trim().min(1),
  price: z.number().positive(),
  color_variants: z.array(z.string()).optional(),
  collection_name: z.string().optional(),
  description: z.string().optional(),
});

export type ProductBase = z.infer<typeof productBaseSchema>;

// --- Database/Product Entity ---
export type Product = Omit<ProductBase, "collection_name"> & {
  id: string;
  created_at: string;
  updated_at: string;
  image_urls: string[];
  primary_image_url: string;
  products_collection?: { name: string } | null;
};

// ----------- ADMIN ONLY!!! ----------- //

export const createProductSchema = productBaseSchema.extend({
  product_images: z.array(z.instanceof(File)).min(1).max(3),
  primary_image_url: z
    .url({ message: "Invalid image URL" })
    .optional()
    .nullable(),
});

export const updateProductSchema = productBaseSchema.partial().extend({
  product_id: z.string(),
  new_product_images: z.array(z.instanceof(File)).optional(),
  image_urls_to_delete: z.array(z.string()).optional(),
  primary_image_url: z
    .url({ message: "Invalid image URL" })
    .optional()
    .nullable(),
});

export type NewProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

// ----------- ADMIN ONLY!!! ----------- //
