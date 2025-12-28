import { SupabaseClient } from "supabase";
import { DeleteCartItemsRequest } from "@shared/schema/api/cart.ts";
import { CartRepository } from "../cart-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const deleteCartItems = async (
  supabase: SupabaseClient,
  payload: DeleteCartItemsRequest,
  profileId: string,
) => {
  const { data: cart, error: getCartIdByProfileIdError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (getCartIdByProfileIdError || !cart?.id) {
    console.log(
      `Failed to get cartId by profileId: ${getCartIdByProfileIdError}`,
    );
    throw AppError.internal();
  }

  const { data, error } = await CartRepository.deleteCartItems(
    supabase,
    cart.id,
    payload.productIds,
  );

  if (error || !data) {
    console.log(`Failed to delete cart items: ${error}`);
    throw AppError.internal();
  }

  const deletedProductIds = data.map((item) => item.id);

  return {
    deletedProductIds,
  };
};
