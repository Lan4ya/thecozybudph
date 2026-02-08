import { CartRepository } from "../cart-repository.ts";
import { AddCartItemsInput, CartItem } from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";
import { snakeToCamel } from "../../../utils/caseConverter.ts";

export const addCartItems = async (
  supabase: SupabaseType,
  payload: AddCartItemsInput,
  profileId: string,
): Promise<CartItem> => {
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

  const { data, error } = await CartRepository.upsertCartItem(
    supabase,
    cart.id,
    payload.productId,
    payload.quantity,
  );

  const cartItem = data?.[0] ?? null;

  if (error) {
    throw AppError.internal(error.message);
  }

  if (!cartItem) {
    throw AppError.internal(
      "Invariant violation: upsert cart item returned no data",
    );
  }

  return snakeToCamel(cartItem);
};
