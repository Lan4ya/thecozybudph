import z from "zod";
import {
  createOrderSchema,
  confirmOrderSchema,
  createShippingQuoteSchema,
  shippingQuoteSchema,
  paymentMethodTypesSchema,
  quoteStop,
} from "../../zod/index.ts";

export type PaymentMethodTypes = z.infer<typeof paymentMethodTypesSchema>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ConfirmOrderInput = z.infer<typeof confirmOrderSchema>;

export type CreateShippingQuoteInput = z.infer<
  typeof createShippingQuoteSchema
>;
export type QuoteStop = z.infer<typeof quoteStop>;
export type ShippingQuote = z.infer<typeof shippingQuoteSchema>;

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type CreatePaymentRes = {
  redirectUrls: {
    paymentUrl: string;
    returnUrl: string;
  };
  id: string;
  status: string;
};
