import { z } from "zod";
import { createAddressSchema } from "./address.ts";
import { addCartItemSchema } from "./cart.ts";

export const orderSourceSchema = z.object({
  source: z.enum(["cart", "shop"]),
});

export const orderItemsSchema = z
  .array(addCartItemSchema)
  .min(1, "order must have at least one item");

export const orderAddressSchema = createAddressSchema;

export const createOrderSchema = orderSourceSchema.extend({
  items: orderItemsSchema,
  addressId: z.uuid("addressId is not a valid UUID"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
