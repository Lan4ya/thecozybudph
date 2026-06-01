import z from "zod";
import {
  getOrderPaymentStatusDataSchema,
  paymentMethodTypesSchema,
} from "../../zod/api/index.ts";
import { paymentStatusSchema } from "../../zod/index.ts";

export type PaymentMethodTypes = z.infer<typeof paymentMethodTypesSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// Status that's shown to user right after creating and paying for an order.
// This doesn't include all payment statuses from the database.
// Only the client-facing ones are exposed.
export type GetPaymentStatusRes = z.infer<
  typeof getOrderPaymentStatusDataSchema
>;
