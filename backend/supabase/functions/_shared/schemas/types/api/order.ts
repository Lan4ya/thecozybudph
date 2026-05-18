import { z } from "zod";
import type {
  CustomerOrderItem,
  CustomerOrderStatus,
} from "../domain/order.ts";
import type { queryOrdersSchema } from "../../zod/order.ts";
import type { PaymentStatus } from "./payment.ts";
import { createOrderSchema, payOrderSchema } from "../../zod/order.ts";
import type { Address } from "../domain/address.ts";

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

export type QueryOrdersRes = {
  id: string;
  status: CustomerOrderStatus;
  serviceType: "motorcycle" | "sedan";
  items: CustomerOrderItem[];

  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  passOnFee: number;
  totalCents: number;

  address: Omit<Address, "id" | "isDefault">;

  createdAt: Date | null;
  expiresAt: Date;
}[];

export type CreateOrderRes = {
  orderId: string;
  paymentId: string;
};

export type PayOrderRes = {
  paymentId: string;
  paymentUrl: string | null;
  status: PaymentStatus;
};
