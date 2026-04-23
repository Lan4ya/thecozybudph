import { ProductVariant } from "../index.ts";
import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";
import type { Tables } from "./supabase.types.ts";

export type OrdersRow = Tables<"orders">;
export type OrderItemsRow = Tables<"order_items_snapshots">;
export type OrderAddressSnapshots = Tables<"order_address_snapshots">;

export type CreateOrderDBInput = SnakeToCamel<
  Omit<OrdersRow, "id" | "updated_at" | "created_at">
>;

export type CreateOrderItemDBInput = SnakeToCamel<
  Omit<OrderItemsRow, "id" | "variant_attributes" | "order_id">
> & {
  variantAttributes: ProductVariant["attributes"];
};
