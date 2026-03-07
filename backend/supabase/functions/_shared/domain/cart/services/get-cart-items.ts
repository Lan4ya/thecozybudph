import { SupabaseType } from "@shared/types.d.ts";
import { CartRepository } from "../cart-repository.ts";

import { CartItem } from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const getCartItems = async (
  supabase: SupabaseType,
  profileId: string,
): Promise<CartItem[]> => {
  const { data: cart, error } = await CartRepository.getCartByProfileId(
    supabase,
    profileId,
  );

  if (error) throw AppError.internal("Failed to get cart", { cause: error });

  if (!cart?.id)
    throw AppError.notFound(`Cart for profile ${profileId} not found`);

  let data: CartItem[];
  try {
    data = await CartRepository.getCartItems(cart.id);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw AppError.internal("Failed adding product to cart", {
      cause: error,
    });
  }

  if (!data) {
    throw AppError.internal(
      "Invariant violation: getCartItems returned no data without error",
    );
  }

  return data;
};
