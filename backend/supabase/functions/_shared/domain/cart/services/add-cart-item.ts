import { CartRepository } from "../cart-repository.ts";
import { AddCartItemsInput } from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const addCartItems = async (
  supabase: SupabaseType,
  payload: AddCartItemsInput,
  profileId: string,
) => {
  const { data: cart, error: cartError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (cartError) {
    throw AppError.internal(cartError.message);
  }

  // A cart for the user is automatically created after user signup via a
  // postgres trigger 'on_auth_user_created' so cart.id should always exist.
  // Meaning this should NEVER happen. If it does, something is broken.
  if (!cart?.id) {
    throw AppError.internal(
      "Invariant violation: get cart by profile id returned no data",
    );
  }

  const { data: cartItem, error } = await CartRepository.upsertCartItem(
    supabase,
    cart.id,
    payload.productId,
    payload.quantity,
  );

  if (error) {
    throw AppError.internal(error.message);
  }

  if (!cartItem) {
    throw AppError.internal(
      "Invariant violation: upsert cart item returned no data",
    );
  }

  return cartItem;
};
