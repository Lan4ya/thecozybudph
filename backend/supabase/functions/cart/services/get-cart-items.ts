import { SupabaseType } from "@shared/types.d.ts";
import { CartRepository } from "../cart-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const getCartItems = async (
  supabase: SupabaseType,
  profileId: string,
) => {
  const { data: cart, error: getCartIdByProfileIdError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (getCartIdByProfileIdError || !cart?.id) {
    throw AppError.internal();
  }

  const { data, error } = await CartRepository.getCartItems(supabase, cart.id);

  if (error || !data) {
    throw AppError.internal(error?.message);
  }

  return data;
};
