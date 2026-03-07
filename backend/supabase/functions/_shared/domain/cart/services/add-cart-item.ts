import { CartRepository } from "../cart-repository.ts";
import { AddCartItemInput, CartItem } from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const addCartItem = async (
  supabase: SupabaseType,
  payload: AddCartItemInput,
  profileId: string,
): Promise<CartItem> => {
  const { data: cart, error: cartError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (cartError) {
    throw AppError.internal(cartError.message);
  }

  // A cart for the user is automatically created after user signup via a
  // postgres trigger named 'on_auth_user_created' so cart.id should always exist.
  // Meaning this should NEVER happen. If it does, something is broken.
  if (!cart?.id) {
    throw AppError.internal(
      "Invariant violation: get cart by profile id returned no data",
    );
  }

  let cartItem;
  try {
    cartItem = await CartRepository.upsertCartItem(cart.id, payload);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw AppError.internal("Failed adding product to cart", {
      cause: error,
    });
  }

  if (!cartItem) {
    throw AppError.internal(
      "Invariant violation: upsert cart item returned no data",
    );
  }

  return cartItem;
};
