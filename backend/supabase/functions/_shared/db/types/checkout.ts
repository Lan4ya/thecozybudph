import {
  OrderAddressSnapshotInsert,
  OrderInsert,
  OrderItemSnapshotInsert,
} from "./orders.ts";
import { PaymentInsert } from "./payments.ts";

export type InsertCheckout = {
  order: Omit<OrderInsert, "id">;
  items: Omit<OrderItemSnapshotInsert, "id" | "orderId">[];
  address: Omit<OrderAddressSnapshotInsert, "id" | "orderId">;
  payment: Omit<PaymentInsert, "orderId">;
};
