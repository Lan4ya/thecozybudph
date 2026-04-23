import z from "zod";
import {
  addCartItemSchema,
  updateCartItemSchema,
  deleteCartItemsSchema,
} from "../../zod/cart.ts";
import { CartItem } from "../domain/index.ts";

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type DeleteCartItemsInput = z.infer<typeof deleteCartItemsSchema>;

export type UpdateCartItemRes = {
  item: CartItem;
  deletedItemId: string | null;
};

export type DeleteCartItemsRes = {
  deletedItemIds: string[];
};
