import { createOrder } from "./create-order.ts";
import { queryOrders } from "./query-orders.ts";
import { getOrderItem } from "./get-order-item.ts";
import { payOrder } from "./pay-order.ts";
import { handlePaymentWebhook } from "./handle-payment-webhook.ts";
import { getOrderPaymentStatus } from "./query-order-payment-status.ts";

export const OrderActions = {
  createOrder,
  queryOrders,
  getOrderItem,
  payOrder,
  handlePaymentWebhook,
  getOrderPaymentStatus,
};
