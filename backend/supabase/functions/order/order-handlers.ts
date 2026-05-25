import { RouteHandler } from "@hono/zod-openapi";
import { OrderActions } from "@shared/modules/order/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireBindings, requireVariables } from "@shared/utils/mod.ts";
import {
  createOrderRoute,
  getOrderPaymentStatusRoute,
  getOrderItemRoute,
  payOrderRoute,
  queryOrdersRoute,
} from "./order-routes.ts";
import { Context } from "hono";

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

export const getOrderItemHandler: RouteHandler<
  typeof getOrderItemRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const { id: itemId } = c.req.valid("param");
  const data = await OrderActions.getOrderItem(db, itemId, profileId);
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
  return c.json({ data }, 200);
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
  const data = await OrderActions.getOrderPaymentStatus(db, paymentId);
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
