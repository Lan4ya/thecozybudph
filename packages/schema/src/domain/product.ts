import z from "zod";

export const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(250, "name can't exceed 250 characters"),

  price: z.coerce
    .number("price must be a valid number")
    .min(0, "price can't be negative")
    .max(1000000, "price can't exceed 1,000,000")
    .transform((val) => Math.round(val * 100) / 100),

  colorVariants: z
    .array(
      z
        .string()
        .trim()
        .min(1, "color variant must contain at least 1 character")
        .max(50, "color variant can't exceed 50 characters"),
    )
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "category is required")
    .max(50, "category can't exceed 50 characters"),

  collectionName: z
    .string()
    .trim()
    .min(1, "collection must contain at least 1 character")
    .max(150, "collection can't exceed 150 characters")
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .min(1, "description name must contain at least 1 character")
    .max(600, "description can't exceed 600 characters")
    .optional()
    .nullable(),
});

export type ProductBase = z.infer<typeof productBaseSchema>;
