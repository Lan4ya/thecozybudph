import { client, unwrapData } from "./_client";
import isDev from "@/lib/utils/isDev";
import type {
  AddCartItemInput,
  CartItem,
  DeleteCartItemsRes,
  DeleteCartItemsInput,
  UpdateCartItemInput,
  UpdateCartItemRes,
} from "@cozybud/schemas";

export const CartAPI = {
  getItems: async (): Promise<CartItem[]> => {
    isDev && console.log("fetching cart items...");
    const { data: raw } = await client.cart.GET("/cart/items");
    return unwrapData(raw, "GET /cart/items");
  },

  addItems: async (payload: AddCartItemInput): Promise<CartItem> => {
    const { data: raw } = await client.cart.POST("/cart/items", {
      body: payload,
    });
    return unwrapData(raw, "POST /cart/items");
  },

  updateItemsVariant: async (
    id: string,
    payload: UpdateCartItemInput,
  ): Promise<UpdateCartItemRes> => {
    isDev && console.log("updating cart item...");
    const { data: raw } = await client.cart.PATCH("/cart/items/{id}", {
      params: { path: { id } },
      body: payload,
    });
    return unwrapData(raw, "PATCH /cart/items/{id}");
  },

  deleteItems: async (
    payload: DeleteCartItemsInput,
  ): Promise<DeleteCartItemsRes> => {
    const { data: raw } = await client.cart.DELETE("/cart/items", {
      body: payload,
    });
    return unwrapData(raw, "DELETE /cart/items");
  },
};
