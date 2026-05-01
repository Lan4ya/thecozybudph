import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";

export const getOrders = async (db: DrizzleClient, profileId: string) => {
  return await OrderRepository.getUserOrders(db, profileId);
};
