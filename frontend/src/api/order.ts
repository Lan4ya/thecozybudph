import { client, unwrapData } from "./_client";
import isDev from "@/lib/utils/isDev";
import type {
  PayOrderInput,
  PayOrderRes,
  QueryOrdersInput,
  CreateOrderInput,
  CreateOrderRes,
  GetPaymentStatusRes,
  QueryOrderRes,
  GetOrderWithItemsRes as GetOrderWithItemsRes,
  GetOrderStatusRes,
} from "@cozybud/schemas";

export const OrderAPI = {
  queryOrders: async (params: QueryOrdersInput): Promise<QueryOrderRes[]> => {
    isDev && console.log("querying orders...");

    const { status, limit, offset } = params;
    const { data: raw } = await client.order.GET("/order", {
      params: { query: { status, limit, offset } },
    });
    const data = unwrapData(raw, "GET /order");
    return data.map((r) => ({
      ...r,
      expiresAt: new Date(r.expiresAt),
      createdAt: new Date(r.createdAt),
    }));
  },

  getOrderWithItems: async (orderId: string): Promise<GetOrderWithItemsRes> => {
    isDev && console.log("fetching order item", orderId);

    const { data: raw } = await client.order.GET("/order/{id}", {
      params: { path: { id: orderId } },
    });
    const data = unwrapData(raw, "GET /order/{id}");
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
    };
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

  getOrderStatus: async (orderId: string): Promise<GetOrderStatusRes> => {
    const { data: raw } = await client.order.GET("/order/{id}/status", {
      params: { path: { id: orderId } },
    });
    return unwrapData(raw, "GET /order/{id}/status");
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
