import { z } from "zod";
import { coerceNumber } from "../utils/coerce.ts";

export const addCartItemsSchema = z.object({
  productId: z.uuid("productId is not a valid UUID"),
  quantity: coerceNumber(
    z.number("quantity must be a number").positive("quantity can't be 0"),
  ),
  productVariant: z.object({
    sku: z.string().trim().nonempty(),
    priceCents: coerceNumber(
      z.number("price must be a number").positive("price can't be 0"),
    ),
    options: z.record(
      z.string().trim().nonempty(),
      z.string().trim().nonempty(),
    ),
  }),
});

export const deleteCartItemsSchema = z.object({
  productIds: z
    .array(z.uuid("one or more productIds have an invalid UUID"))
    .min(1, "at least one productId is required"),
});

export type AddCartItemsInput = z.infer<typeof addCartItemsSchema>;
export type DeleteCartItemsInput = z.infer<typeof deleteCartItemsSchema>;
