import type { PaymentStatus } from "./payment.ts";
import z from "zod";
import { createOrderSchema, confirmOrderSchema } from "../../zod/checkout.ts";

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PayOrderInput = z.infer<typeof confirmOrderSchema>;

export type CreatePaymentRes = {
  redirectUrls: {
    paymentUrl: string;
    returnUrl: string;
  };
  id: string;
  status: string;
};

export type CreateOrderRes = {
  orderId: string;
  paymentId: string;
};

export type PayOrderRes = {
  paymentId: string;
  paymentUrl: string | null;
  status: PaymentStatus;
};
