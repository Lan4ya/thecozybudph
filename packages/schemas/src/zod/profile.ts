import z from "zod";
import { phMobileSchema } from "./common.ts";

export const updateProfileSchema = z.object({
  phone: phMobileSchema.optional(),
  email: z.email("not a valid email").optional(),
  name: z
    .string()
    .trim()
    .min(1, "name must be atleast 1 or more characters")
    .max(255, "name can't exceed 255 characters")
    .optional(),
});

export const profileSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.email(),
});

// API response wrapper
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

// Response schemas (wrapped with `data`)
export const getProfileResponseSchema = apiResponseSchema(profileSchema);
export const updateProfileResponseSchema = apiResponseSchema(profileSchema);

// Error response schema remains the same
export const errorResponseSchema = z.object({
  error: z.union([
    z.string(),
    z.array(z.object({ message: z.string(), field: z.string().optional() })),
  ]),
});
