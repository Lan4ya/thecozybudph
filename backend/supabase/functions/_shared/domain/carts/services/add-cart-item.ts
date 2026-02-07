import { CartRepository } from "../cart-repository.ts";
import { AddCartItemsInput } from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const addCartItem = async (
  supabase: SupabaseType,
  payload: AddCartItemsInput,
  profileId: string,
) => {
  const { data: cart, error: cartError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (cartError) {
    throw AppError.internal(cartError.message);
  }

  let cartId: string = cart?.id;
  if (!cartId) {
    const { data: newCart, error: insertError } =
      await CartRepository.insertCart(supabase, profileId);

    if (insertError || !newCart?.id) {
      if (insertError?.code === "23505") {
        const { data: existingCart, error: refetchError } =
          await CartRepository.getCartByProfileId(supabase, profileId);

        if (refetchError || !existingCart?.id) {
          throw AppError.internal(refetchError?.message);
        }

        cartId = existingCart.id;
      } else {
        throw AppError.internal(insertError?.message);
      }
    } else {
      cartId = newCart.id;
    }
  }

  const { data, error } = await CartRepository.upsertCartItem(
    supabase,
    cartId,
    payload.productId,
    payload.quantity,
  );

  if (error) {
    throw AppError.internal(error.message);
  }

  return { data, error };
};
