import { addCartItem } from "./add-cart-item.ts";
import { getCartItems } from "./get-cart-items.ts";
import { deleteCartItems } from "./delete-cart-items.ts";
import { updateCartItem } from "./update-cart-item.ts";

export const CartService = {
  addCartItem,
  getCartItems,
  deleteCartItems,
  updateCartItem,
};
