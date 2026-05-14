import { DrizzleClient } from "../../../db/client.ts";
import { DBOrderStatus } from "../../../schemas/index.ts";
import { OrderRepository } from "../order-repository.ts";

type Q = {
  status: DBOrderStatus;
  limit: number;
  offset: number;
};

export const getOrders = async (
  db: DrizzleClient,
  profileId: string,
  query: Q,
) => {
  return await OrderRepository.getOrders(db, profileId, query);
};
