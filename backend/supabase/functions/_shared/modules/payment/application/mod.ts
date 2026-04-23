import { payOrder } from "./pay-order.ts";
import { handlePaymentWebhook } from "./handle-payment-webhook.ts";
import { getPaymentStatus } from "./get-payment-status.ts";

export const PaymentActions = {
  payOrder,
  handlePaymentWebhook,
  getPaymentStatus,
};
