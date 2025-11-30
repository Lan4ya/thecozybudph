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
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(600, "description can't exceed 600 characters")
    .optional()
    .nullable(),
});

export type ProductBase = z.infer<typeof productBaseSchema>;
