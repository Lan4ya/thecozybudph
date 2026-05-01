import { apiClient } from "@/lib/axios/client";
import isDev from "@/lib/utils/isDev";
import type {
  ConfirmOrderReq,
  PayOrderRes,
  CreateOrderReq,
  CreateOrderRes,
  CreateQuotationsRes,
  CreateShippingQuoteInput,
} from "@TheCozyBud/schemas";

export const CheckoutAPI = {
  createShippingQuotes: async (
    payload: CreateShippingQuoteInput,
  ): Promise<CreateQuotationsRes> => {
    isDev && console.log("creating shipping quotes...", payload);
    return await apiClient.post("/checkout/shipping/quotes", payload);
  },

  createOrder: async (payload: CreateOrderReq): Promise<CreateOrderRes> => {
    isDev && console.log("creating order...");
    return await apiClient.post("/checkout/order", payload);
  },

  payOrder: async (
    orderId: string,
    payload: ConfirmOrderReq,
    idempotencyKey: string,
  ): Promise<PayOrderRes> => {
    isDev && console.log("confirming order...");
    return await apiClient.post(`/checkout/order/${orderId}/pay`, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  },
};
