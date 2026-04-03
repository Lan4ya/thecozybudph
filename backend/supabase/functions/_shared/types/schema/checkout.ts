import { z } from "zod";
import { createOrderSchema } from "./order.ts";
import { createPaymentSchema } from "./payment.ts";

export const checkoutSchema = z.object({
  order: createOrderSchema,
  payment: createPaymentSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
