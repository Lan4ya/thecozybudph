import type { Tables } from "./supabase.types.ts";

export type OrdersRow = Tables<"orders">;
export type OrderItemsRow = Tables<"order_items">;

export type CreateOrderDBInput = Omit<OrdersRow, "id" | "created_at">;
export type CreateOrderItemsDBInput = Array<
  Omit<OrderItemsRow, "id" | "created_at">
>;
