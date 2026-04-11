import { AppError } from "@shared/errors/Errors.ts";
import {
  DeleteCartItemsInput,
  DeleteCartItemsRes,
} from "@shared/package-types/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { CartRepository } from "../cart-repository.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";

export const deleteCartItems = async (
  db: DrizzleClient,
  payload: DeleteCartItemsInput,
  profileId: string,
): Promise<DeleteCartItemsRes> => {
  const cart = await CartRepository.getCartByProfileId(db, profileId);

  if (!cart?.id) {
    throw AppError.internal(
      "Invariant violation: get cart by profile id returned no data",
    );
  }

  try {
    const data = await CartRepository.deleteCartItems(
      db,
      cart.id,
      payload.cartItemIds,
    );

    const deletedItemIds = data.map((item) => item.id);

    return { deletedItemIds };
  } catch (error) {
    throw handleDbError("Failed to delete cart items", error);
  }
};
