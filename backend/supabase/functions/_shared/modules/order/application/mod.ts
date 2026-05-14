import { createShippingQuotation } from "@shared/integrations/lalamove/mod.ts";
import { createOrder } from "./create-order.ts";
import { getOrder } from "./get-order.ts";
import { getOrders } from "./get-orders.ts";

export const OrderActions = {
  createOrder,
  getOrder,
  getOrders,
  createShippingQuotation,
};
