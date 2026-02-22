import { z } from "zod";
import { phMobileSchema } from "./common.ts";

export const createAddressSchema = z.object({
  fullName: z.string().trim().min(1, "full name can't be empty"),
  region: z.string().trim().min(1, "region can't be empty"),
  city: z.string().trim().min(1, "city can't be empty"),
  province: z.string().trim().min(1, "province can't be empty"),
  postalCode: z.string().trim().min(1, "postal code can't be empty"),
  barangay: z.string().trim().min(1, "barangay can't be empty"),
  addressLine: z.string().trim().min(1, "address line can't be empty"),
  phoneNumber: phMobileSchema,
});

export const updateAddressSchema = createAddressSchema.partial();

export const addressIdSchema = z.object({
  id: z.uuid("invalid address id"),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
