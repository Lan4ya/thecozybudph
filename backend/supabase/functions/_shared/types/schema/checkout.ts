import { z } from "zod";
import { createOrderSchema } from "./order.ts";
import { createPaymentSchema } from "./payment.ts";

export const checkoutSchema = z.object({
  orderDetails: createOrderSchema,
  paymentDetails: createPaymentSchema.omit({ orderId: true }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
