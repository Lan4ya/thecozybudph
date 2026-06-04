import { OrderAPI } from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: ["orders", orderId],
    queryFn: async () => await OrderAPI.getOrderStatus(orderId),
    meta: { persist: true },
  });
