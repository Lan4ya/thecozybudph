import { createPayment } from "./create-payment.ts";
import { handlePaymentWebhook } from "./handle-payment-webhook.ts";

export const PaymentService = {
  createPayment,
  handlePaymentWebhook,
};
