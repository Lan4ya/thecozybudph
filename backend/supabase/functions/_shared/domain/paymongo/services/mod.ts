import { attachPaymentIntent } from "./attach-payment-intent.ts";
import { createPaymentIntent } from "./create-payment-intent.ts";
import { createPaymentMethod } from "./create-payment-method.ts";
import { handleCheckoutWebhook } from "./handle-checkout-webhook.ts";

export const PayMongoService = {
  handleCheckoutWebhook,
  attachPaymentIntent,
  createPaymentIntent,
  createPaymentMethod,
};
