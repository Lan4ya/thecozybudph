import { RouteHandler } from "@hono/zod-openapi";
import { ShippingActions } from "@shared/modules/shipping/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { isDev, requireVariables } from "@shared/utils/mod.ts";
import {
  addShippingOrderPriorityFeeRoute,
  cancelShipOrderRoute,
  changeShippingDriverRoute,
  createShippingQuoteRoute,
  getShippingCityRoute,
  getShippingDriverRoute,
  getShippingMarketRoute,
  editShippingOrderRoute,
  getShippingOrderRoute,
  shipOrderRoute,
} from "./shipment-routes.ts";

export const createShippingQuoteHandler: RouteHandler<
  typeof createShippingQuoteRoute,
  AppEnv
> = async (c) => {
  const payload = c.req.valid("json");
  const data = await ShippingActions.createShippingQuotation(payload);
  isDev && console.log("[createShippingQuoteHandler] data", data);
  return c.json({ data }, 200);
};

export const shipOrderHandler: RouteHandler<
  typeof shipOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const payload = c.req.valid("json");
  const { id: orderId } = c.req.valid("param");
  const data = await ShippingActions.shipOrder(db, orderId, payload);
  return c.json({ data }, 200);
};

export const cancelShipOrderHandler: RouteHandler<
  typeof cancelShipOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: orderId } = c.req.valid("param");
  const data = await ShippingActions.cancelShipmentOrder(db, orderId);
  return c.json({ data }, 200);
};

export const getShippingOrderHandler: RouteHandler<
  typeof getShippingOrderRoute,
  AppEnv
> = async (c) => {
  const { id: shippingOrderId } = c.req.valid("param");
  const res = await ShippingActions.getShippingOrder(shippingOrderId);
  return c.json({ data: res }, 200);
};

export const addShippingOrderPriorityFeeHandler: RouteHandler<
  typeof addShippingOrderPriorityFeeRoute,
  AppEnv
> = async (c) => {
  const payload = c.req.valid("json");
  const res = await ShippingActions.addShippingOrderPriorityFee(payload);
  return c.json({ data: res }, 200);
};

export const getShippingDriverHandler: RouteHandler<
  typeof getShippingDriverRoute,
  AppEnv
> = async (c) => {
  const query = c.req.valid("query");
  const res = await ShippingActions.getShippingDriver(query);
  return c.json({ data: res }, 200);
};

export const changeShippingDriverHandler: RouteHandler<
  typeof changeShippingDriverRoute,
  AppEnv
> = async (c) => {
  const payload = c.req.valid("json");
  const res = await ShippingActions.changeShippingDriver(payload);
  return c.json({ data: res }, 200);
};

export const getShippingCityHandler: RouteHandler<
  typeof getShippingCityRoute,
  AppEnv
> = async (c) => {
  const { cityId } = c.req.valid("param");
  const res = await ShippingActions.getShippingCity({ cityId });
  return c.json({ data: res }, 200);
};

export const getShippingMarketHandler: RouteHandler<
  typeof getShippingMarketRoute,
  AppEnv
> = async (c) => {
  const res = await ShippingActions.getShippingMarket();
  return c.json({ data: res }, 200);
};

export const editShippingOrderHandler: RouteHandler<
  typeof editShippingOrderRoute,
  AppEnv
> = async (c) => {
  const payload = c.req.valid("json");
  const res = await ShippingActions.editShippingOrder(payload);
  return c.json({ data: res }, 200);
};
