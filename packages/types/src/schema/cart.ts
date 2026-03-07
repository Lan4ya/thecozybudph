import { z } from "zod";
import { coerceNumber } from "../utils/coerce.ts";

export const addCartItemSchema = z.object({
  quantity: coerceNumber(
    z.number("quantity must be a number").positive("quantity can't be 0"),
  ),
  productId: z.uuid("productId is not a valid UUID"),
  variantId: z.uuid("variantId is not a valid UUID"),
  cardMessages: z.preprocess((val) => {
    if (!Array.isArray(val)) return [];
    return val.filter(Boolean);
  }, z.array(z.string().trim()).default([])),
});

export const updateCartItemSchema = z.object({
  newVariantId: z.uuid("variantId is not a valid UUID").optional(),
  quantity: coerceNumber(
    z.number("quantity must be a number").positive("quantity can't be 0"),
  ).optional(),
  cardMessages: z.preprocess((val) => {
    if (!Array.isArray(val)) return [];
    return val.filter(Boolean);
  }, z.array(z.string().trim()).default([])),
});

export const cartItemIdSchema = z.object({
  id: z.uuid("cartItemId is not a valid UUID"),
});

export const deleteCartItemsSchema = z.object({
  cartItemIds: z
    .array(z.uuid("one or more cartItemIds have an invalid UUID"))
    .min(1, "at least one productId is required"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type DeleteCartItemsInput = z.infer<typeof deleteCartItemsSchema>;
