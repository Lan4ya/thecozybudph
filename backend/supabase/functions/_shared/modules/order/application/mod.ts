import { createShippingQuotation } from "@shared/integrations/lalamove/mod.ts";
import { createOrder } from "./create-order.ts";
import { queryOrders } from "./query-orders.ts";
import { getOrder } from "./get-order.ts";
import { payOrder } from "./pay-order.ts";
import { handlePaymentWebhook } from "./handle-payment-webhook.ts";
import { getOrderPaymentStatus } from "./query-order-payment-status.ts";

export const OrderActions = {
  createOrder,
  queryOrders,
  getOrder,
  createShippingQuotation,
  payOrder,
  handlePaymentWebhook,
  getPaymentStatus: getOrderPaymentStatus,
};
