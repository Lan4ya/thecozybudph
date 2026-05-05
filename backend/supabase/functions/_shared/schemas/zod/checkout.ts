import { z } from "zod";
import { addCartItemSchema } from "./cart.ts";
import { createAddressSchema } from "./address.ts";

// The app will allow gcash and banks as payment method type
export const paymentMethodTypesSchema = z.enum(["gcash", "brankas"]); // brankas is online banking
export const serviceTypeSchema = z.enum(["motorcycle", "sedan"]);
export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

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
  serviceType: serviceTypeSchema,
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
