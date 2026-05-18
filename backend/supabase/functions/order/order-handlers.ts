import { RouteHandler } from "@hono/zod-openapi";
import { OrderActions } from "@shared/modules/order/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireBindings, requireVariables } from "@shared/utils/mod.ts";
import {
  createOrderRoute,
  createShippingQuoteRoute,
  getOrderPaymentStatusRoute,
  getOrderRoute,
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
  const res = await OrderActions.queryOrders(db, profileId, query);
  return c.json({ data: res }, 200);
};

export const getOrderHandler: RouteHandler<
  typeof getOrderRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const { id: orderId } = c.req.valid("param");
  const res = await OrderActions.getOrder(db, profileId, orderId);
  return c.json({ data: res }, 200);
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
  const res = await OrderActions.createOrder(db, supabaseService, {
    profileId,
    payload,
    idempotencyKey,
  });
  return c.json({ data: res }, 200);
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
  const res = await OrderActions.payOrder(db, {
    payload,
    orderId,
    idempotencyKey,
    appURL: APP_URL,
  });
  return c.json({ data: res }, 200);
};

export const getOrderPaymentStatusHandler: RouteHandler<
  typeof getOrderPaymentStatusRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: paymentId } = c.req.valid("param");
  const res = await OrderActions.getPaymentStatus(db, paymentId);
  return c.json({ data: res }, 200);
};

export const createShippingQuoteHandler: RouteHandler<
  typeof createShippingQuoteRoute,
  AppEnv
> = async (c) => {
  const payload = c.req.valid("json");
  const res = await OrderActions.createShippingQuotation(payload);
  return c.json({ data: res }, 200);
};

export const orderPaymentWebhookHandler = async (c: any) => {
  const rawBody = await c.req.text();
  const signatureHeader = c.req.header("Paymongo-Signature");
  const res = await OrderActions.handlePaymentWebhook(rawBody, signatureHeader);
  return c.json(res, 200);
};
