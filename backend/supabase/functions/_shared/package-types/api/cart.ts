import { CartItem } from "../domain/index.ts";

export type UpdateCartItemRes = {
  item: CartItem;
  deletedItemId: string | null;
};

export type DeleteCartItemsRes = {
  deletedItemIds: string[];
};
