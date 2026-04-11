import { z } from "zod";
import { createAddressSchema } from "./address.ts";
import { addCartItemSchema } from "./cart.ts";
import { paymentMethodTypesSchema } from "./payment.ts";

export const orderSourceSchema = z.object({
  source: z.enum(["cart", "shop"]),
});

export const orderItemSchema = addCartItemSchema;

export const orderAddressSchema = createAddressSchema;

export const createOrderSchema = orderSourceSchema.extend({
  items: z.array(orderItemSchema).min(1, "order must have at least one item"),
  addressId: z.uuid("addressId is not a valid UUID"),
  shippingQuoteId: z.string().trim().min(1, "shippingQuoteId can't be empty"),
  paymentMethodType: paymentMethodTypesSchema,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
