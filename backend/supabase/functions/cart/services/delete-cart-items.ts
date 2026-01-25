import { SupabaseType } from "@shared/types.d.ts";
import { DeleteCartItemsRequest } from "@shared/core/api/cart.ts";
import { CartRepository } from "../cart-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const deleteCartItems = async (
  supabase: SupabaseType,
  payload: DeleteCartItemsRequest,
  profileId: string,
) => {
  const { data: cart, error: getCartIdByProfileIdError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (getCartIdByProfileIdError || !cart?.id) {
    throw AppError.internal(getCartIdByProfileIdError?.message);
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
