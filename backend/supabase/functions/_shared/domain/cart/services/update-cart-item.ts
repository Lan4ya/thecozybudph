import { UpdateCartItemInput, UpdateCartItemRes } from "@shared/types/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";
import { CartRepository } from "../cart-repository.ts";

export const updateCartItem = async (
  db: DrizzleClient,
  cartItemId: string,
  payload: UpdateCartItemInput,
): Promise<UpdateCartItemRes> => {
  try {
    return await CartRepository.updateCartItem(db, cartItemId, payload);
  } catch (error) {
    throw handleDbError("Failed to update cart item", error);
  }
};
