import { z } from "zod";
import type {
  createOrderSchema,
  getOrderItemDataSchema,
  payOrderSchema,
  queryOrderDataSchema,
  queryOrdersSchema,
} from "../../zod/api/order.ts";
import type { PaymentStatus } from "./payment.ts";

export type QueryOrdersInput = z.infer<typeof queryOrdersSchema>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PayOrderInput = z.infer<typeof payOrderSchema>;

export type CreatePaymentRes = {
  redirectUrls: {
    paymentUrl: string;
    returnUrl: string;
  };
  id: string;
  status: string;
};

export type GetOrderItemRes = z.infer<typeof getOrderItemDataSchema>;

export type QueryOrderRes = z.infer<typeof queryOrderDataSchema>;

export type CreateOrderRes = {
  orderId: string;
  paymentId: string;
};

export type PayOrderRes = {
  paymentId: string;
  paymentUrl: string | null;
  status: PaymentStatus;
};
