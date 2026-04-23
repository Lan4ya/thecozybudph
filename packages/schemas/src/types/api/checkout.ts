import Lalamove from "@lalamove/lalamove-js";
import type { PaymentStatus } from "./payment.ts";

export type CreateQuotationsRes = Lalamove.IQuotation[];

export type CreateOrderRes = {
  orderId: string;
  paymentId: string;
};

export type PayOrderRes = {
  paymentId: string;
  paymentUrl: string | null;
  status: PaymentStatus;
};
