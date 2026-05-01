import Lalamove from "@lalamove/lalamove-js";
import type { PaymentStatus } from "./payment.ts";
import z from "zod";
import {
  createOrderSchema,
  confirmOrderSchema,
  createShippingQuoteSchema,
  quoteStop,
  shippingQuoteSchema,
} from "../../zod/checkout.ts";

export type CreateOrderReq = z.infer<typeof createOrderSchema>;
export type ConfirmOrderReq = z.infer<typeof confirmOrderSchema>;

export type CreateShippingQuoteInput = z.infer<
  typeof createShippingQuoteSchema
>;
export type QuoteStop = z.infer<typeof quoteStop>;
export type ShippingQuote = z.infer<typeof shippingQuoteSchema>;
export type CreatePaymentRes = {
  redirectUrls: {
    paymentUrl: string;
    returnUrl: string;
  };
  id: string;
  status: string;
};

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
