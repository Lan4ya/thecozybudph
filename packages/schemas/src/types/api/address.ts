import { z } from "zod";
import { createAddressSchema, updateAddressSchema } from "@TheCozyBud/schemas";

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
