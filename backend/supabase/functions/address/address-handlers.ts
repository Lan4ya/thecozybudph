import { RouteHandler } from "@hono/zod-openapi";
import { AddressActions } from "@shared/modules/address/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables } from "@shared/utils/mod.ts";
import {
  createAddressRoute,
  getAddressesRoute,
  getDefaultAddressRoute,
  updateAddressRoute,
} from "./address-routes.ts";

export const createAddressHandler: RouteHandler<
  typeof createAddressRoute,
  AppEnv
> = async (c) => {
  const payload = c.req.valid("json");
  const { db, claims, isAdmin } = requireVariables(
    c,
    "db",
    "claims",
    "isAdmin",
  );
  const profileId = claims.sub;
  const res = await AddressActions.createAddress(
    db,
    profileId,
    isAdmin,
    payload,
  );
  return c.json({ data: res }, 200);
};

export const updateAddressHandler: RouteHandler<
  typeof updateAddressRoute,
  AppEnv
> = async (c) => {
  const { db, isAdmin } = requireVariables(c, "db", "isAdmin");
  const payload = c.req.valid("json");
  const { id } = c.req.valid("param");
  const res = await AddressActions.updateAddress(db, id, isAdmin, payload);
  return c.json({ data: res }, 200);
};

export const getDefaultAddressesHandler: RouteHandler<
  typeof getDefaultAddressRoute,
  AppEnv
> = async (c) => {
  const { db, claims } = requireVariables(c, "db", "claims");
  const profileId = claims.sub;
  const res = await AddressActions.getDefaultAddress(db, profileId);
  return c.json({ data: res }, 200);
};

export const getAddressesHandler: RouteHandler<
  typeof getAddressesRoute,
  AppEnv
> = async (c) => {
  const { db, claims } = requireVariables(c, "db", "claims");
  const profileId = claims.sub;
  const res = await AddressActions.getAddresses(db, profileId);
  return c.json({ data: res }, 200);
};
