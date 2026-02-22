import { SupabaseType } from "@shared/types.d.ts";
import { CartRepository } from "../cart-repository.ts";

import { CartItem } from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { snakeToCamel } from "../../../utils/caseConverter.ts";

export const getCartItems = async (
  supabase: SupabaseType,
  profileId: string,
): Promise<CartItem[]> => {
  const { data: cart, error: getCartIdByProfileIdError } =
    await CartRepository.getCartByProfileId(supabase, profileId);

  if (getCartIdByProfileIdError || !cart?.id) {
    throw AppError.internal();
  }

  const { data, error } = await CartRepository.getCartItems(supabase, cart.id);

  if (error) {
    throw AppError.internal(error?.message);
  }

  if (!data) {
    throw AppError.internal(
      "Invariant violation: getCartItems returned no data without error",
    );
  }

  return snakeToCamel(data as unknown as CartItem[]);
};
