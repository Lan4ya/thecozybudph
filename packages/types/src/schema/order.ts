import { z } from "zod";
import { coerceNumber } from "../utils/coerce.ts";

export const createOrderSchema = z.object({
  addressId: z.uuid("not a valid address id"),

  // If null means the user ordered directly from the shop, not from cart items.
  // this is needed to properly remove cart items from cart once checked out
  cartId: z.uuid("not a valid cart id").nullable(),

  subtotalCents: coerceNumber(
    z
      .number("subtotal must be a number")
      .nonnegative("subtotal can't be negative"),
  ),
  shippingCents: coerceNumber(
    z
      .number("shipping must be a number")
      .nonnegative("shipping can't be negative"),
  ),
  discountCents: coerceNumber(
    z
      .number("discount must be a number")
      .nonnegative("discount can't be negative"),
  ),
  totalCents: coerceNumber(
    z.number("total must be a number").nonnegative("total can't be negative"),
  ),

  orderItems: z
    .array(
      z.object({
        productId: z.string("product id is required"),
        name: z.string("product id is required"),
        quantity: coerceNumber(
          z
            .number()
            .positive("please order at least one item")
            .max(100_000, "quantity can't exceed 100,000"),
        ),
        priceCents: coerceNumber(
          z.number().nonnegative("price can't be negative"),
        ),
      }),
    )
    .min(1, "order must have at least one item"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
