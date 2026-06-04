import { RouteHandler } from "@hono/zod-openapi";
import { OrderActions } from "@shared/modules/order/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { isDev, requireBindings, requireVariables } from "@shared/utils/mod.ts";
import { Context } from "hono";
import {
  createOrderRoute,
  getOrderWithItemsRoute,
  getOrderPaymentStatusRoute,
  getOrderStatusRoute,
  payOrderRoute,
  queryOrdersRoute,
} from "./order-routes.ts";

export const queryOrderHandler: RouteHandler<
  typeof queryOrdersRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const query = c.req.valid("query");
  const data = await OrderActions.queryOrders(db, profileId, query);
  return c.json({ data: data }, 200);
};

export const getOrderStatusHandler: RouteHandler<
  typeof getOrderStatusRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id } = c.req.valid("param");
  const data = await OrderActions.getOrderStatus(db, id);
  isDev && console.log(data);
  return c.json({ data }, 200);
};

export const getOrderWithItemsHandler: RouteHandler<
  typeof getOrderWithItemsRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const { id: orderId } = c.req.valid("param");
  const data = await OrderActions.getOrderItem(db, orderId, profileId);
  return c.json({ data }, 200);
};

export const createOrderHandler: RouteHandler<
  typeof createOrderRoute,
  AppEnv
> = async (c) => {
  const { supabaseService, claims, db } = requireVariables(
    c,
    "supabaseService",
    "claims",
    "db",
  );
  const profileId = claims.sub;
  const payload = c.req.valid("json");
  const idempotencyKey = c.req.header("Idempotency-Key");
  const data = await OrderActions.createOrder(db, supabaseService, {
    profileId,
    payload,
    idempotencyKey,
  });
  isDev && console.log({ data });
  return c.json({ data }, 201);
};

export const payOrderHandler: RouteHandler<
  typeof payOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { APP_URL } = requireBindings(c, "APP_URL");
  const payload = c.req.valid("json");
  const { id: orderId } = c.req.valid("param");
  const idempotencyKey = c.req.header("Idempotency-Key");
  const data = await OrderActions.payOrder(db, {
    payload,
    orderId,
    idempotencyKey,
    appURL: APP_URL,
  });
  return c.json({ data: data }, 200);
};

export const getOrderPaymentStatusHandler: RouteHandler<
  typeof getOrderPaymentStatusRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: paymentId } = c.req.valid("param");
  const data = await OrderActions.getActivePaymentStatus(db, paymentId);
  console.log({ data });
  return c.json({ data }, 200);
};

export const orderPaymentWebhookHandler = async (c: Context) => {
  const rawBody = await c.req.text();
  const signatureHeader = c.req.header("Paymongo-Signature");
  const data = await OrderActions.handlePaymentWebhook(
    rawBody,
    signatureHeader,
  );
  return c.json(data, 200);
};
