import { SupabaseClient } from "supabase";
import { CartRepository } from "../cart-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const getCartItems = async (
  supabase: SupabaseClient,
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

  const { data, error } = await CartRepository.getCartItems(supabase, cart.id);

  if (error || !data) {
    console.log("Failed to get cart items: ${error}");
    throw AppError.internal();
  }

  return data;
};
