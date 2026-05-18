import { apiClient } from "@/lib/axios/client";
import isDev from "@/lib/utils/isDev";
import type {
  PayOrderInput,
  PayOrderRes,
  QueryOrdersInput,
  CreateOrderInput,
  CreateOrderRes,
  CreateQuotationsRes,
  CreateShippingQuoteInput,
  GetPaymentStatusRes,
  QueryOrdersRes,
} from "@cozybud/schemas";

export const OrderAPI = {
  queryOrders: async (params: QueryOrdersInput): Promise<QueryOrdersRes> => {
    console.log({ params });
    const res: QueryOrdersRes = await apiClient.get("/order", {
      params,
    });

    return res.map((r) => ({
      ...r,
      expiresAt: new Date(r.expiresAt),
    }));
  },

  getOrder: async (orderId: string): Promise<QueryOrdersRes[number]> => {
    const res: QueryOrdersRes[number] = await apiClient.get(
      `/order/${orderId}`,
    );
    return {
      ...res,
      expiresAt: new Date(res.expiresAt),
    };
  },

  createShippingQuotes: async (
    payload: CreateShippingQuoteInput,
  ): Promise<CreateQuotationsRes> => {
    isDev && console.log("creating shipping quotes...", payload);
    return await apiClient.post("/order/shipping/quotes", payload);
  },

  createOrder: async (
    payload: CreateOrderInput,
    idempotencyKey: string,
  ): Promise<CreateOrderRes> => {
    isDev && console.log("creating order...");
    return await apiClient.post("/order", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  },

  payOrder: async (
    orderId: string,
    payload: PayOrderInput,
    idempotencyKey: string,
  ): Promise<PayOrderRes> => {
    isDev && console.log("confirming order...");
    return await apiClient.post(`/order/${orderId}/pay`, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  },

  getOrderPaymentStatus: async (
    paymentId: string,
  ): Promise<GetPaymentStatusRes> => {
    isDev && console.log("getting payment status...");
    return await apiClient.get(`/order/payment/${paymentId}/status`);
  },
};
