import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";

export const getUserOrders = async (db: DrizzleClient, profileId: string) => {
  return await OrderRepository.getUserOrders(db, profileId);
};
