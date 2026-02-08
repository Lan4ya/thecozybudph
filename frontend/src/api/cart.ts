import { apiClient } from "@/lib/axios/client";

import type {
  AddCartItemsInput,
  CartItem,
  CartItemsDeletionResult,
  DeleteCartItemsInput,
} from "@TheCozyBud/types";

export const CartAPI = {
  getCartItems: async (): Promise<CartItem[]> => {
    return apiClient.get("/cart/items");
  },

  addCartItem: async (cartItem: AddCartItemsInput): Promise<CartItem> => {
    return apiClient.post("/cart/items", cartItem);
  },

  deleteCartItems: async (
    deleteCartItems: DeleteCartItemsInput,
  ): Promise<CartItemsDeletionResult> => {
    return apiClient.delete("/cart/items", { data: deleteCartItems });
  },
};
