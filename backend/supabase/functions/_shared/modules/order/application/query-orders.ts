import { toCustomerStatus } from "@shared/modules/order/to-order-status.ts";
import { DBOrderStatus, QueryOrderRes } from "@shared/schemas/index.ts";
import { QueryOrdersInput } from "@shared/schemas/types/api/order.ts";
import { toSnakeCase } from "drizzle-orm/casing";
import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";

export const queryOrders = async (
  db: DrizzleClient,
  profileId: string,
  query: QueryOrdersInput,
): Promise<QueryOrderRes[]> => {
  const { status, ...rest } = query;

  const dbStatus = status ? (toSnakeCase(status) as DBOrderStatus) : undefined;

  const orders = await OrderRepository.queryOrders(db, profileId, {
    status: dbStatus,
    ...rest,
  });

  return orders.map((o) => ({
    ...o,
    status: toCustomerStatus(o.status),
    items: o.items,
  }));
};
