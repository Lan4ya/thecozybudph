import z from "zod";
import {
  paymentMethodTypesSchema,
  paymentStatusSchema,
} from "../../zod/index.ts";

export type PaymentMethodTypes = z.infer<typeof paymentMethodTypesSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export type GetPaymentStatusRes = {
  status: PaymentStatus;
  expiresAt: Date;
};
