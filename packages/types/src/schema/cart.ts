import { z } from "zod";

export const addCartItemsSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().positive(),
});

export const deleteCartItemsSchema = z.object({
  productIds: z.array(z.uuid()).min(1),
});

export type AddCartItemsInput = z.infer<typeof addCartItemsSchema>;
export type DeleteCartItemsInput = z.infer<typeof deleteCartItemsSchema>;
