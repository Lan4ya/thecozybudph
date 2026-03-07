import { SupabaseType } from "@shared/types.d.ts";
import {
  DeleteCartItemsRes,
  DeleteCartItemsInput,
} from "@shared/types/index.ts";
import { CartRepository } from "../cart-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const deleteCartItems = async (
  supabase: SupabaseType,
  payload: DeleteCartItemsInput,
  profileId: string,
): Promise<DeleteCartItemsRes> => {
  const { data: cart, error: cartErr } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (cartErr || !cart?.id) {
    throw AppError.internal(cartErr?.message);
  }

  const { data, error } = await CartRepository.deleteCartItems(
    supabase,
    cart.id,
    payload.cartItemIds,
  );

  if (error || !data) {
    throw AppError.internal(error?.message);
  }

  const deletedItemIds = data.map((item) => item.id);

  return {
    deletedItemIds,
  };
};
