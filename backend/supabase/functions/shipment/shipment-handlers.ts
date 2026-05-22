import { RouteHandler } from "@hono/zod-openapi";
import { ShippingActions } from "@shared/modules/shipping/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables } from "@shared/utils/mod.ts";
import {
  // cancelShipOrderRoute,
  createShippingQuoteRoute,
  getShippingOrderRoute,
} from "./shipment-routes.ts";

export const createShippingQuoteHandler: RouteHandler<
  typeof createShippingQuoteRoute,
  AppEnv
> = async (c) => {
  const payload = c.req.valid("json");
  const data = await ShippingActions.createShippingQuotation(payload);
  return c.json({ data }, 200);
};

// export const shipOrderHandler: RouteHandler<
//   typeof shipOrderRoute,
//   AppEnv
// > = async (c) => {
//   const { db } = requireVariables(c, "db");
//   const payload = c.req.valid("json");
//   const { id: orderId } = c.req.valid("param");
//   const data = await ShippingActions.shipOrder(db, orderId, payload);
//   return c.json({ data }, 200);
// };

// export const cancelShipOrderHandler: RouteHandler<
//   typeof cancelShipOrderRoute,
//   AppEnv
// > = async (c) => {
//   const { db } = requireVariables(c, "db");
//   const { id: orderId } = c.req.valid("param");
//   const data = await ShippingActions.cancelShipmentOrder(db, orderId);
//   return c.json({ data }, 200);
// };

export const getShippingOrderHandler: RouteHandler<
  typeof getShippingOrderRoute,
  AppEnv
> = async (c) => {
  const { id: shippingOrderId } = c.req.valid("param");
  const res = await ShippingActions.getShippingOrder(shippingOrderId);
  return c.json({ data: res }, 200);
};
