import { SupabaseType } from "@shared/types.d.ts";
import {
  DeleteCartItemsRes,
  DeleteCartItemsInput,
} from "@shared/types/index.ts";
import { CartRepository } from "../cart-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const deleteCartItems = async (
  db: DrizzleClient,
  supabase: SupabaseType,
  payload: DeleteCartItemsInput,
  profileId: string,
): Promise<DeleteCartItemsRes> => {
  const cart = await CartRepository.getCartByProfileId(db, profileId);

  if (!cart?.id) {
    throw AppError.internal(
      "Invariant violation: get cart by profile id returned no data",
    );
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
