import {
  UpdateCartItemInput,
  UpdateCartItemRes,
} from "@shared/package-types/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { CartRepository } from "../cart-repository.ts";

export const updateCartItem = async (
  db: DrizzleClient,
  cartItemId: string,
  payload: UpdateCartItemInput,
): Promise<UpdateCartItemRes> => {
  return await CartRepository.updateCartItem(db, cartItemId, payload);
};
