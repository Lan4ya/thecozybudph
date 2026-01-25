import { z } from "zod";
// import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

// REQUEST TYPES:

export const addCartItemsSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().positive(),
});

export const deleteCartItemsSchema = z.object({
  productIds: z.array(z.uuid()).min(1),
});

export type AddCartItemsRequest = z.infer<typeof addCartItemsSchema>;
export type DeleteCartItemsRequest = z.infer<typeof deleteCartItemsSchema>;

// RESPONSE TYPES:
