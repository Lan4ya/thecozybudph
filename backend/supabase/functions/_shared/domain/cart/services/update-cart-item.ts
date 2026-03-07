import { CartRepository } from "../cart-repository.ts";
import { UpdateCartItemInput, CartItem } from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const updateCartItem = async (
  cartItemId: string,
  payload: UpdateCartItemInput,
): Promise<CartItem> => {
  let cartItem;
  try {
    cartItem = await CartRepository.updateCartItem(cartItemId, payload);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw AppError.internal("Failed to update cart item variant", {
      cause: error,
    });
  }

  if (!cartItem) {
    throw AppError.internal(
      "Invariant violation: updateCartItemVariant returned no data",
    );
  }

  return cartItem;
};
