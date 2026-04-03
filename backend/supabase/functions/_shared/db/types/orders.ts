import { InferInsertModel } from "drizzle-orm";
import {
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
} from "../schema/orders.ts";

export type OrderItemSnapshotInsert = InferInsertModel<
  typeof orderItemsSnapshots
>;

export type OrderInsert = InferInsertModel<typeof orders>;

export type OrderAddressSnapshotInsert = InferInsertModel<
  typeof orderAddressesSnapshot
>;
