import isDev from "@/lib/utils/isDev";
import type {
  AddShippingOrderPriorityFeeInput,
  CancelShipOrderData,
  ChangeShippingDriverInput,
  CreateShippingQuoteData,
  CreateShippingQuoteInput,
  EditShippingOrderInput,
  GetShippingDriverInput,
  GetShippingOrderData,
  ShipOrderData,
  ShipOrderInput,
} from "@cozybud/schemas";
import { client, unwrapData } from "./_client";

export const ShipmentAPI = {
  createShippingQuote: async (
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

  shipOrder: async (
    orderId: string,
    payload: ShipOrderInput,
  ): Promise<ShipOrderData> => {
    isDev && console.log(`shipping order ${orderId}...`, payload);
    const { data: raw } = await client.shipment.PATCH(
      "/shipment/order/{id}/shipment",
      {
        params: { path: { id: orderId } },
        body: payload,
      },
    );
    return unwrapData(raw, `PATCH /shipment/order/${orderId}/shipment`);
  },

  getShippingOrder: async (
    shippingOrderId: string,
  ): Promise<GetShippingOrderData> => {
    const { data: raw } = await client.shipment.GET("/shipment/{id}", {
      params: { path: { id: shippingOrderId } },
    });
    return unwrapData(raw, `GET /shipment/${shippingOrderId}`);
  },

  cancelShipOrder: async (orderId: string): Promise<CancelShipOrderData> => {
    const { data: raw } = await client.shipment.DELETE(
      "/shipment/order/{id}/shipment",
      {
        params: { path: { id: orderId } },
      },
    );
    return unwrapData(raw, `DELETE /shipment/order/${orderId}/shipment`);
  },

  addPriorityFee: async (
    payload: AddShippingOrderPriorityFeeInput,
  ): Promise<Record<string, unknown>> => {
    const { data: raw } = await client.shipment.POST(
      "/shipment/order/priority-fee",
      {
        body: payload,
      },
    );
    return unwrapData(raw, "POST /shipment/order/priority-fee");
  },

  getDriver: async (
    query: GetShippingDriverInput,
  ): Promise<Record<string, unknown>> => {
    const { data: raw } = await client.shipment.GET("/shipment/driver", {
      params: { query },
    });
    return unwrapData(raw, "GET /shipment/driver");
  },

  changeDriver: async (
    payload: ChangeShippingDriverInput,
  ): Promise<Record<string, unknown>> => {
    const { data: raw } = await client.shipment.POST(
      "/shipment/driver/change",
      {
        body: payload,
      },
    );
    return unwrapData(raw, "POST /shipment/driver/change");
  },

  getCity: async (cityId: string): Promise<Record<string, unknown>> => {
    const { data: raw } = await client.shipment.GET("/shipment/city/{cityId}", {
      params: { path: { cityId } },
    });
    return unwrapData(raw, `GET /shipment/city/${cityId}`);
  },

  getMarket: async (): Promise<Record<string, unknown>> => {
    const { data: raw } = await client.shipment.GET("/shipment/market");
    return unwrapData(raw, "GET /shipment/market");
  },

  editOrder: async (
    payload: EditShippingOrderInput,
  ): Promise<Record<string, unknown>> => {
    const { data: raw } = await client.shipment.PATCH("/shipment/order/edit", {
      body: payload,
    });
    return unwrapData(raw, "PATCH /shipment/order/edit");
  },
};
