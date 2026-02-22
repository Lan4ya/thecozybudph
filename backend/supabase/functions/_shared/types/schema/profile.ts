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

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
