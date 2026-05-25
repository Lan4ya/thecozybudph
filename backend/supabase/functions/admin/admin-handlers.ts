import { RouteHandler } from "@hono/zod-openapi";
import { AdminActions } from "@shared/modules/admin/mod.ts";
import { ProductActions } from "@shared/modules/product/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables } from "@shared/utils/mod.ts";
import {
  createProductRoute,
  deleteProductRoute,
  getAdminAnalyticsRoute,
  getAdminOrdersRoute,
  updateProductRoute,
} from "./admin-routes.ts";

export const getAnalyticsHandler: RouteHandler<
  typeof getAdminAnalyticsRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const res = await AdminActions.getAnalytics(db);
  return c.json({ data: res }, 200);
};

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

export const getOrdersHandler: RouteHandler<
  typeof getAdminOrdersRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const query = c.req.valid("query");
  const res = await AdminActions.getOrders(db, query);
  return c.json({ data: res }, 200);
};
