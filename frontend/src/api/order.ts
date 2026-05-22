import { client, unwrapData } from "./_client";
import isDev from "@/lib/utils/isDev";
import type {
  PayOrderInput,
  PayOrderRes,
  QueryOrdersInput,
  CreateOrderInput,
  CreateOrderRes,
  CreateShippingQuoteInput,
  GetPaymentStatusRes,
  QueryOrdersRes,
  CreateShippingQuoteData,
} from "@cozybud/schemas";

export const OrderAPI = {
  queryOrders: async (params: QueryOrdersInput): Promise<QueryOrdersRes> => {
    const { status, limit, offset } = params;
    const { data: raw } = await client.order.GET("/order", {
      params: { query: { status, limit, offset } },
    });
    const data = unwrapData(raw, "GET /order");
    return data.map((r) => ({
      ...r,
      expiresAt: new Date(r.expiresAt),
      createdAt: r.createdAt ? new Date(r.createdAt) : null,
    }));
  },

  getOrder: async (id: string): Promise<QueryOrdersRes[number]> => {
    const { data: raw } = await client.order.GET("/order/{id}", {
      params: { path: { id } },
    });
    const data = unwrapData(raw, "GET /order");
    return {
      ...data,
      expiresAt: new Date(data.expiresAt),
      createdAt: data.createdAt ? new Date(data.expiresAt) : null,
    };
  },

  createShippingQuotes: async (
    payload: CreateShippingQuoteInput,
  ): Promise<CreateShippingQuoteData[]> => {
    isDev && console.log("creating shipping quotes...", payload);
    const { data: raw } = await client.shipment.POST("/shipment/quotes", {
      body: payload,
    });
    const data = unwrapData(raw, "POST /shipment/quotes");

    return data.map((quote) => ({
      ...quote,
      scheduleAt: new Date(quote.scheduleAt),
      expiresAt: new Date(quote.expiresAt),
    }));
  },

  createOrder: async (
    payload: CreateOrderInput,
    idempotencyKey: string,
  ): Promise<CreateOrderRes> => {
    isDev && console.log("creating order...");
    const { data: raw } = await client.order.POST("/order", {
      body: payload,
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    return unwrapData(raw, "POST /order");
  },

  payOrder: async (
    orderId: string,
    payload: PayOrderInput,
    idempotencyKey: string,
  ): Promise<PayOrderRes> => {
    isDev && console.log("confirming order...");
    const { data: raw } = await client.order.POST("/order/{id}/pay", {
      body: payload,
      params: { path: { id: orderId } },
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    return unwrapData(raw, "PATCH /order/{id}/pay");
  },

  getOrderPaymentStatus: async (
    paymentId: string,
  ): Promise<GetPaymentStatusRes> => {
    isDev && console.log("getting payment status...");
    const { data: raw } = await client.order.GET("/order/payment/{id}/status", {
      params: { path: { id: paymentId } },
    });
    const data = unwrapData(raw, "GET /order/payment/{id}/status");
    return {
      ...data,
      expiresAt: new Date(data.expiresAt),
    };
  },
};
