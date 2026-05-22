import { z } from "zod";
import {
  addressDataSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../../zod/api/index.ts";

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export type Address = z.infer<typeof addressDataSchema>;
