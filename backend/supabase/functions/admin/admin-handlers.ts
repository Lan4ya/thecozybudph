import { RouteHandler } from "@hono/zod-openapi";
import { AdminActions } from "@shared/modules/admin/mod.ts";
import { ProductActions } from "@shared/modules/product/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { isDev, requireVariables } from "@shared/utils/mod.ts";
import { getAnalyticsRoute } from "./admin-routes/admin-analytics-routes.ts";
import {
  getOrderRoute,
  queryOrdersRoute,
} from "./admin-routes/admin-order-routes.ts";
import {
  createProductRoute,
  deleteProductRoute,
  updateProductRoute,
} from "./admin-routes/admin-product-routes.ts";
import {
  cancelShipmentOrderRoute,
  createShipmentOrderRoute,
  createShipmentQuoteRoute,
  getShipmentOrderRoute,
  getShippingDriverRoute,
  handleWebhookRoute,
} from "./admin-routes/admin-shipment-routes.ts";

// ------------------------- Analytics -------------------------

export const getAnalyticsHandler: RouteHandler<
  typeof getAnalyticsRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const res = await AdminActions.getAnalytics(db);
  return c.json({ data: res }, 200);
};

// ------------------------- Product -------------------------

export const createProductHandler: RouteHandler<
  typeof createProductRoute,
  AppEnv
> = async (c) => {
  const { db, supabaseService } = requireVariables(c, "db", "supabaseService");
  const payload = c.req.valid("form");
  const res = await ProductActions.createProduct(db, supabaseService, payload);
  return c.json({ data: res }, 200);
};

export const updateProductHandler: RouteHandler<
  typeof updateProductRoute,
  AppEnv
> = async (c) => {
  const { db, supabaseService } = requireVariables(c, "db", "supabaseService");
  const { id: productId } = c.req.valid("param");
  const payload = c.req.valid("form");
  const res = await ProductActions.updateProduct(
    db,
    supabaseService,
    productId,
    payload,
  );
  return c.json({ data: res }, 200);
};

export const deleteProductHandler: RouteHandler<
  typeof deleteProductRoute,
  AppEnv
> = async (c) => {
  const { db, supabaseService } = requireVariables(c, "db", "supabaseService");
  const payload = c.req.valid("json");
  const res = await ProductActions.deleteProducts(db, supabaseService, payload);
  return c.json({ data: res }, 200);
};

// ------------------------- Order -------------------------

export const getOrderHandler: RouteHandler<
  typeof getOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: orderId } = c.req.valid("param");
  const data = await AdminActions.getOrder(db, orderId);
  return c.json({ data }, 200);
};

export const queryOrdersHandler: RouteHandler<
  typeof queryOrdersRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const query = c.req.valid("query");
  const res = await AdminActions.queryOrders(db, query);
  return c.json({ data: res }, 200);
};

// ------------------------- Shipment -------------------------

export const createShippingQuoteHandler: RouteHandler<
  typeof createShipmentQuoteRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const payload = c.req.valid("json");
  const data = await AdminActions.createShipmentQuotation(db, payload);
  return c.json({ data }, 200);
};

export const createShipmentOrderHandler: RouteHandler<
  typeof createShipmentOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const payload = c.req.valid("json");
  const { id: orderId } = c.req.valid("param");
  const data = await AdminActions.createShipmentOrder(db, payload, orderId);
  return c.json({ data }, 200);
};

export const cancelShipOrderHandler: RouteHandler<
  typeof cancelShipmentOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: orderId } = c.req.valid("param");
  const data = await AdminActions.cancelShipmentOrder(db, orderId);
  return c.json({ data }, 200);
};

export const getShipmentOrderHandler: RouteHandler<
  typeof getShipmentOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: orderId } = c.req.valid("param");
  const data = await AdminActions.getShipmentOrder(db, orderId);
  isDev && console.log(data);
  return c.json({ data }, 200);
};

export const getShippingDriverHandler: RouteHandler<
  typeof getShippingDriverRoute,
  AppEnv
> = async (c) => {
  const query = c.req.valid("query");
  const res = await AdminActions.getShipmentDriver(query);
  return c.json({ data: res }, 200);
};

export const handleShipmentWebhook: RouteHandler<
  typeof handleWebhookRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const rawBody = await c.req.text();
  const authHeader = c.req.header("Authorization");
  const data = await AdminActions.handleShipmentWebhook(
    db,
    rawBody,
    authHeader,
  );
  return c.json({ data }, 200);
};

// export const addShippingOrderPriorityFeeHandler: RouteHandler<
//   typeof addShippingOrderPriorityFeeRoute,
//   AppEnv
// > = async (c) => {
//   const payload = c.req.valid("json");
//   await AdminActions.addShippingOrderPriorityFee(payload);
//   const res = await AdminActions.getShipmentOrder(payload.orderId);
//   return c.json({ data: res }, 200);
// };

// export const changeShippingDriverHandler: RouteHandler<
//   typeof changeShippingDriverRoute,
//   AppEnv
// > = async (c) => {
//   const payload = c.req.valid("json");
//   await AdminActions.changeShippingDriver(payload);
//   return c.json({ data: { id: payload.driverId } }, 200);
// };

// export const getShippingCityHandler: RouteHandler<
//   typeof getShippingCityRoute,
//   AppEnv
// > = async (c) => {
//   const { cityId } = c.req.valid("param");
//   const res = await AdminActions.getShippingCity({ cityId });
//   return c.json({ data: res }, 200);
// };
//
// export const getShippingMarketHandler: RouteHandler<
//   typeof getShippingMarketRoute,
//   AppEnv
// > = async (c) => {
//   const res = await AdminActions.getShippingMarket();
//   return c.json({ data: res }, 200);
// };
//

// export const editShippingOrderHandler: RouteHandler<
//   typeof editShipmentOrderRoute,
//   AppEnv
// > = async (c) => {
//   const { db } = requireVariables(c, "db");
//   const { id: orderId } = c.req.valid("param");
//   const payload = c.req.valid("json");
//
//   const order = await OrderRepository.getByIdAdmin(db, orderId);
//   if (!order || !order.shipmentOrderId) {
//     throw AppError.notFound({ message: "Shipment not found for this order" });
//   }
//
//   const res = await AdminActions.editShippingOrder({
//     ...payload,
//     orderId: order.shipmentOrderId,
//   });
//   return c.json({ data: res }, 200);
// };
