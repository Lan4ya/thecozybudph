import { SupabaseClient } from "supabase";
import { CartRepository } from "../cart-repository.ts";
import { AddCartItemsRequest } from "@shared/schema/api/cart.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const addCartItem = async (
  supabase: SupabaseClient,
  payload: AddCartItemsRequest,
  profileId: string,
) => {
  const { data: cart, error: cartError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (cartError) {
    console.log(`Failed to get cart: ${cartError.message}`);
    throw AppError.internal();
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
          console.log(
            `Failed to get cart after conflict: ${refetchError?.message}`,
          );
          throw AppError.internal();
        }

        cartId = existingCart.id;
      } else {
        console.log(`Failed to insert cart: ${insertError?.message}`);
        throw AppError.internal();
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
    console.log(`Failed to upsert cart items: ${error.message}`);
    throw AppError.internal;
  }

  return { data, error };
};
