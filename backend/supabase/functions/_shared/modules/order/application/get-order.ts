import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";

export const getOrder = async (db: DrizzleClient, id: string) => {
  return await OrderRepository.getById(db, id);
};
