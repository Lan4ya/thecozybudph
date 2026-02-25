import { CartRepository } from "../cart-repository.ts";
import {
  AddCartItemsInput,
  CartItem,
  ProductVariant,
} from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

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
  // postgres trigger named 'on_auth_user_created' so cart.id should always exist.
  // Meaning this should NEVER happen. If it does, something is broken.
  if (!cart?.id) {
    throw AppError.internal(
      "Invariant violation: get cart by profile id returned no data",
    );
  }

  let cartItemRaw;
  try {
    cartItemRaw = await CartRepository.upsertCartItem(
      cart.id,
      payload.productId,
      payload.quantity,
      payload.productVariant,
      payload.cardMessages,
    );
  } catch (error) {
    const msg = error instanceof AppError ? error.message : error;
    throw AppError.internal("Failed adding product to cart", { cause: msg });
  }

  if (!cartItemRaw) {
    throw AppError.internal(
      "Invariant violation: upsert cart item returned no data",
    );
  }

  const cartItem: CartItem = {
    ...cartItemRaw,
    productVariant: cartItemRaw.productVariant as unknown as ProductVariant,
  };

  return cartItem;
};
