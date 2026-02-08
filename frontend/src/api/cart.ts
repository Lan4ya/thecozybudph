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

  addCartItem: async (payload: AddCartItemsInput): Promise<CartItem> => {
    return apiClient.post("/cart/items", payload);
  },

  deleteCartItems: async (
    payload: DeleteCartItemsInput,
  ): Promise<CartItemsDeletionResult> => {
    return apiClient.delete("/cart/items", { data: payload });
  },
};
