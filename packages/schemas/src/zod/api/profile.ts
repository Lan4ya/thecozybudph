import { z } from "@hono/zod-openapi";
import { phMobileSchema } from "../common.ts";
import { apiSuccessResponseSchema } from "./_response.ts";

// ----------------------- REQUEST SCHEMAS -----------------------

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

// ----------------------- DATA SCHEMAS -----------------------

export const profileDataSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.email(),
});

// ----------------------- RESPONSE SCHEMAS -----------------------

export const getProfileResponseSchema =
  apiSuccessResponseSchema(profileDataSchema);

export const updateProfileResponseSchema =
  apiSuccessResponseSchema(profileDataSchema);
