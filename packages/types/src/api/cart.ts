import { CartItem } from "../domain/cart.ts";

export type DeleteCartItemsRes = {
  deletedItemIds: string[];
};

export type UpdateCartItemRes = {
  item: CartItem;
  deletedItemId?: string;
};
