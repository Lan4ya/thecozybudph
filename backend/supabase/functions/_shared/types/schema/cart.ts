import { z } from "zod";
import { coerceNumber } from "../utils/coerce.ts";

// TODO: add validation (in client side) for user cart and checkout:
// Does variant still exist?
// Is it still purchasable?
// Has price changed?

export const addCartItemsSchema = z.object({
  productId: z.uuid("productId is not a valid UUID"),
  quantity: coerceNumber(
    z.number("quantity must be a number").positive("quantity can't be 0"),
  ),
  productVariant: z.object({
    priceCents: coerceNumber(
      z.number("price must be a number").nonnegative("price can't be negative"),
    ),
    options: z.record(
      z.string().trim().nonempty(),
      z.string().trim().nonempty(),
    ),
  }),
  cardMessages: z
    .array(
      z
        .string()
        .trim()
        .nonempty("one or more card message can't be an empty string"),
    )
    .default([]),
});

export const deleteCartItemsSchema = z.object({
  productIds: z
    .array(z.uuid("one or more productIds have an invalid UUID"))
    .min(1, "at least one productId is required"),
});

export type AddCartItemsInput = z.infer<typeof addCartItemsSchema>;
export type DeleteCartItemsInput = z.infer<typeof deleteCartItemsSchema>;
