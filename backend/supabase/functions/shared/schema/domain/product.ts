import z from "zod";

export const productBaseSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),

  price: z.coerce
    .number("Price must be a valid number")
    .min(0, "Price can't be less than 0")
    .max(1000000, "Price can't exceed 1,000,000")
    .transform((val) => Math.round(val * 100) / 100),

  colorVariants: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Color name must contain at least 1 character")
        .max(50, "Color name can't exceed 100 characters"),
    )
    .optional(),

  collectionName: z
    .string()
    .trim()
    .min(1, "Collection name must contain at least 1 character")
    .max(150, "Collection name can't exceed 150 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .min(1, "Description must contain at least 1 character")
    .max(600, "Description can't exceed 600 characters")
    .optional(),
});

export type ProductBase = z.infer<typeof productBaseSchema>;
