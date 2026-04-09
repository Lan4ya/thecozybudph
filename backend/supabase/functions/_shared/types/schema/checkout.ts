import { z } from "zod";
import { createOrderSchema } from "./order.ts";
import { createPaymentSchema } from "./payment.ts";

export const checkoutSchema = z.object({
  order: createOrderSchema,
  payment: createPaymentSchema,
});

export const createShippingQuoteSchema = z.object({
  // serviceType: z.enum(
  //   ["MOTORCYCLE", "SEDAN"],
  //   "invalid serviceType, value must be 'MOTORCYCLE' or 'SEDAN'",
  // ),
  address: z.object({
    region: z.string().trim().min(1, "region can't be empty"),
    city: z.string().trim().min(1, "city can't be empty"),
    province: z.string().trim().min(1, "province can't be empty").optional(),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "postal code must be exactly 4 digits"),
    barangay: z.string().trim().min(1, "barangay can't be empty").optional(),
    addressLine: z.string().trim().min(1, "address line can't be empty"),
  }),
});

const quoteStop = z.object({
  coordinates: z.object({
    lat: z.string().trim().min(1, "lat can't be empty"),
    lng: z.string().trim().min(1, "lng can't be empty"),
  }),
  address: z.string().trim().min(1, "address can't be empty"),
});

export const shippingQuoteSchema = z.object({
  serviceType: z.enum(
    ["MOTORCYCLE", "SEDAN"],
    "invalid serviceType, value must be 'MOTORCYCLE' or 'SEDAN'",
  ),
  stops: z.array(quoteStop).max(2, "stops should only have 2 items"),
});

export type CreateShippingQuoteInput = z.infer<
  typeof createShippingQuoteSchema
>;
export type QuoteStop = z.infer<typeof quoteStop>;
export type ShippingQuote = z.infer<typeof shippingQuoteSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
