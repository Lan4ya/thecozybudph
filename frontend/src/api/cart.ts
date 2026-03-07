import { apiClient } from "@/lib/axios/client";

import type {
  AddCartItemInput,
  CartItem,
  DeleteCartItemsRes,
  DeleteCartItemsInput,
  UpdateCartItemInput,
  UpdateCartItemRes,
} from "@TheCozyBud/types";

export const CartAPI = {
  getItems: async (): Promise<CartItem[]> => {
    console.log("fetching cart items...");
    return apiClient.get("/cart/items");
  },

  addItems: async (payload: AddCartItemInput): Promise<CartItem> => {
    return apiClient.post("/cart/items", payload);
  },

  updateItemsVariant: async (
    cartItemId: string,
    payload: UpdateCartItemInput,
  ): Promise<UpdateCartItemRes> => {
    console.log("updating cart item...");
    return apiClient.patch(`/cart/items/${cartItemId}`, payload);
  },

  deleteItems: async (
    payload: DeleteCartItemsInput,
  ): Promise<DeleteCartItemsRes> => {
    return apiClient.delete("/cart/items", { data: payload });
  },
};
