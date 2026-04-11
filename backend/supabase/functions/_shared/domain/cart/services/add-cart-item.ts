import { AddCartItemInput, CartItem } from "@shared/package-types/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";
import { CartRepository } from "../cart-repository.ts";

export const addCartItem = async (
  db: DrizzleClient,
  payload: AddCartItemInput,
  profileId: string,
): Promise<CartItem> => {
  try {
    const cart = await CartRepository.getCartByProfileId(db, profileId);
    return await CartRepository.upsertCartItem(db, cart.id, payload);
  } catch (error) {
    throw handleDbError("Failed adding product to cart", error);
  }
};
