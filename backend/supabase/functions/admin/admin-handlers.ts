import { RouteHandler } from "@hono/zod-openapi";
import { AdminActions } from "@shared/modules/admin/mod.ts";
import { ProductActions } from "@shared/modules/product/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables, snakeToCamelString } from "@shared/utils/mod.ts";
import {
  cancelShipOrderRoute,
  createProductRoute,
  deleteProductRoute,
  getAdminOrdersRoute,
  getShippingOrderRoute,
  shipOrderRoute,
  updateProductRoute,
} from "./admin-routes.ts";

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
  const deletedProductIds = await ProductActions.deleteProducts(
    db,
    supabaseService,
    payload,
  );
  return c.json({ data: deletedProductIds }, 200);
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

export const shipOrderHandler: RouteHandler<
  typeof shipOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const payload = c.req.valid("json");
  const { id: orderId } = c.req.valid("param");
  const res = await AdminActions.shipOrder(db, orderId, payload);
  return c.json(
    {
      data: {
        ...res,
        status: snakeToCamelString(res.status) as any,
      },
    },
    200,
  );
};

export const cancelShipOrderHandler: RouteHandler<
  typeof cancelShipOrderRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: orderId } = c.req.valid("param");
  const res = await AdminActions.cancelShipmentOrder(db, orderId);
  return c.json(
    {
      data: {
        ...res,
        status: snakeToCamelString(res.status) as any,
      },
    },
    200,
  );
};

export const getShippingOrderHandler: RouteHandler<
  typeof getShippingOrderRoute,
  AppEnv
> = async (c) => {
  const { id: shippingOrderId } = c.req.valid("param");
  const res = await AdminActions.getShippingOrder(shippingOrderId);
  return c.json({ data: res }, 200);
};
