import { AddCartItemInput, CartItem } from "@shared/package-types/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { CartRepository } from "../cart-repository.ts";

export const addCartItem = async (
  db: DrizzleClient,
  payload: AddCartItemInput,
  profileId: string,
): Promise<CartItem> => {
  const cart = await CartRepository.getCartByProfileId(db, profileId);
  return await CartRepository.upsertCartItem(db, cart.id, payload);
};
