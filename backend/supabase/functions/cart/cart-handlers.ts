import { RouteHandler } from "@hono/zod-openapi";
import { CartActions } from "@shared/modules/cart/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables } from "@shared/utils/mod.ts";
import {
  addCartItemRoute,
  deleteCartItemsRoute,
  getCartItemsRoute,
  updateCartItemRoute,
} from "./cart-routes.ts";

export const getCartItemsHandler: RouteHandler<
  typeof getCartItemsRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const res = await CartActions.getCartItems(db, profileId);
  return c.json({ data: res }, 200);
};

export const addCartItemsHandler: RouteHandler<
  typeof addCartItemRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const payload = c.req.valid("json");
  const res = await CartActions.addCartItem(db, payload, profileId);
  return c.json({ data: res }, 200);
};

export const updateCartItemsVariantHandler: RouteHandler<
  typeof updateCartItemRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id: cartItemId } = c.req.valid("param");
  const payload = c.req.valid("json");
  const res = await CartActions.updateCartItem(db, cartItemId, payload);
  return c.json({ data: res }, 200);
};

export const deleteCartItemsHandler: RouteHandler<
  typeof deleteCartItemsRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const payload = c.req.valid("json");
  const res = await CartActions.deleteCartItems(db, payload, profileId);
  return c.json({ data: res }, 200);
};
