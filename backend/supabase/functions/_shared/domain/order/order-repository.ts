import {
  CreateOrderDBInput,
  CreateOrderItemsDBInput,
} from "@shared/types/index.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const OrderRepository = {
  insertOrder: async (s: SupabaseType, order: CreateOrderDBInput) => {
    const { data, error } = await s
      .from("orders")
      .insert(order)
      .select("*")
      .single();

    return { data, error };
  },

  insertOrderItems: async (
    s: SupabaseType,
    orderItems: CreateOrderItemsDBInput,
  ) => {
    const { data, error } = await s
      .from("order_items")
      .insert(orderItems)
      .select("*");

    return { data, error };
  },

  updateOrderStatus: async (
    s: SupabaseType,
    orderId: string,
    status: string,
  ) => {
    const { data, error } = await s
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId)
      .eq("status", status)
      .select()
      .single();

    return { data, error };
  },
};
