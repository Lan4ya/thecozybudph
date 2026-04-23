import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
} from "@TheCozyBud/schemas";

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
