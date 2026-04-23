import { z } from "zod";
import { addCartItemSchema } from "./cart.ts";
import { createAddressSchema } from "./address.ts";

// The app will allow gcash and banks as payment method type
export const paymentMethodTypesSchema = z.enum(["gcash", "brankas"]); // brankas is online banking

export const orderItemSchema = addCartItemSchema;
export const orderAddressSchema = createAddressSchema;
export const orderSourceSchema = z.object({
  source: z.enum(["cart", "shop"]),
});

export const createOrderSchema = orderSourceSchema.extend({
  items: z.array(orderItemSchema).min(1, "order must have at least one item"),
  addressId: z.uuid("addressId is not a valid UUID"),
  shippingQuoteId: z.string().trim().min(1, "shippingQuoteId can't be empty"),
  paymentMethodType: paymentMethodTypesSchema,
});

export const confirmOrderSchema = z.object({
  paymentId: z.uuid("paymentId is not a valid UUID"),
  billing: z.object({
    name: z.string().trim().min(1, "name is required"),
    email: z.email().trim().min(1, "email is required"),
  }),
  type: paymentMethodTypesSchema,
  checkoutSessionId: z.uuid("checkoutSessionId is not a valid UUID"),
});

export const createShippingQuoteSchema = z.object({
  address: z.object({
    region: z.string().trim().min(1, "region can't be empty"),
    city: z.string().trim().min(1, "city can't be empty"),
    // province: z.string().trim().min(1, "province can't be empty").optional(),
    province: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().trim().min(1).optional(),
    ),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "postal code must be exactly 4 digits"),
    barangay: z.string().trim().min(1, "barangay can't be empty").optional(),
    addressLine: z.string().trim().min(1, "address line can't be empty"),
  }),
});

export const quoteStop = z.object({
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
