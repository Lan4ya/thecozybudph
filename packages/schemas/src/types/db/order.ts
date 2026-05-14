import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
} from "../../drizzle/index.ts";
import type { OrderStatus } from "../domain/order.ts";
import type { CamelToSnakeCase } from "../utils.ts";

// export const DB_ORDER_STATUS = [
//   "to_pay",
//   "paid",
//   "to_ship",
//   "shipped",
//   "to_receive",
//   "fulfilled",
//   "cancelled",
//   "expired",
// ] as const;

export type DBOrderStatus = CamelToSnakeCase<OrderStatus>;

export type InsertOrderItemSnapshot = InferInsertModel<
  typeof orderItemsSnapshots
>;

export type InsertOrder = InferInsertModel<typeof orders>;
export type SelectOrder = InferSelectModel<typeof orders>;

export type InsertOrderAddressSnapshot = InferInsertModel<
  typeof orderAddressesSnapshot
>;

export type InsertPendingOrder = {
  order: Omit<InsertOrder, "id">;
  items: Omit<InsertOrderItemSnapshot, "id" | "orderId">[];
  address: Omit<InsertOrderAddressSnapshot, "id" | "orderId">;
};
