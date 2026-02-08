import { SupabaseType } from "@shared/types.d.ts";
import {
  CartItemsDeletionResult,
  DeleteCartItemsInput,
} from "@shared/types/index.ts";
import { CartRepository } from "../cart-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const deleteCartItems = async (
  supabase: SupabaseType,
  payload: DeleteCartItemsInput,
  profileId: string,
): Promise<CartItemsDeletionResult> => {
  const { data: cart, error: cartErr } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (cartErr || !cart?.id) {
    throw AppError.internal(cartErr?.message);
  }

  const { data, error } = await CartRepository.deleteCartItems(
    supabase,
    cart.id,
    payload.productIds,
  );

  if (error || !data) {
    throw AppError.internal(error?.message);
  }

  const deletedProductIds = data.map((item) => item.id);

  return {
    deletedProductIds,
  };
};
