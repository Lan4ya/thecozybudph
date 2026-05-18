import { z } from "zod";
import { phMobileSchema } from "./common.ts";

// API Schemas

export const createAddressSchema = z.object({
  fullName: z.string().trim().min(1, "full name can't be empty"),
  region: z.string().trim().min(1, "region can't be empty"),
  city: z.string().trim().min(1, "city can't be empty"),
  province: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().nullable().optional(),
  ),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "postal code must be exactly 4 digits"),
  barangay: z.string().trim().min(1, "barangay can't be empty"),
  addressLine: z.string().trim().min(1, "address line can't be empty"),
  phoneNumber: phMobileSchema,
  isDefault: z.boolean(),
});

export const updateAddressSchema = createAddressSchema.partial();

export const addressIdSchema = z.object({
  id: z.uuid("invalid address id"),
});

export const addressSchema = createAddressSchema.extend({
  id: z.string().uuid(),
});

// Response schemas
export const getAddressesResponseSchema = z.object({
  data: z.array(addressSchema),
});

export const getAddressResponseSchema = z.object({
  data: addressSchema.nullable(),
});

export const createAddressResponseSchema = z.object({
  data: addressSchema,
});

export const updateAddressResponseSchema = z.object({
  data: addressSchema,
});

// -----------------------------------------------------------------

// Form Schemas

export const createAddressFormSchema = z.object({
  fullName: z.string().trim().min(1, "full name can't be empty"),
  region: z.string().trim().min(1, "region can't be empty"),
  city: z.string().trim().min(1, "city can't be empty"),
  province: z.string().optional(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "postal code must be exactly 4 digits"),
  barangay: z.string().trim().min(1, "barangay can't be empty"),
  addressLine: z.string().trim().min(1, "address line can't be empty"),
  phoneNumber: phMobileSchema,
  isDefault: z.boolean(),
});

export const updateAddressFormSchema = createAddressFormSchema.partial();
