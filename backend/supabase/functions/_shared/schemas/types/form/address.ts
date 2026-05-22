import z from "zod";
import type {
  createAddressFormSchema,
  updateAddressFormSchema,
} from "../../zod/index.ts";

export type CreateAddressFormInput = z.infer<typeof createAddressFormSchema>;
export type UpdateAddressFormInput = z.infer<typeof updateAddressFormSchema>;
