import {
  CreateOrderDBInput,
  CreateOrderItemsDBInput,
} from "@shared/types/index.ts";
import { SupabaseType } from "@shared/types.d.ts";
import { AppError } from "../../errors/Errors.ts";

export const OrderRepository = {
  insertOrder: async (s: SupabaseType, order: CreateOrderDBInput) => {
    const { data, error } = await s
      .from("orders")
      .insert(order)
      .select("*")
      .single();

    if (error) {
      throw AppError.internal(error.message);
    }

    if (!data) {
      throw AppError.internal(
        "Invariant violation: order insert returned no data",
      );
    }

    return data;
  },

  insertOrderItems: async (
    s: SupabaseType,
    orderItems: CreateOrderItemsDBInput,
  ) => {
    const { data, error } = await s
      .from("order_items")
      .insert(orderItems)
      .select("*");

    if (error) {
      throw AppError.internal("insertt order failed", error.message);
    }

    if (!data) {
      throw AppError.internal(
        "Invariant violation: order items insert returned no data",
      );
    }

    return data;
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

    if (error) {
      throw AppError.internal("confirming order failed", error.message);
    }

    if (!data) {
      throw AppError.internal(
        "Invariant violation: order insert returned no data",
      );
    }

    return data;
  },
};
