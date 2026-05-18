import { RouteHandler } from "@hono/zod-openapi";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables } from "@shared/utils/mod.ts";
import { ProfileActions } from "@shared/modules/profile/mod.ts";
import { getProfileRoute, updateProfileRoute } from "./profile-routes.ts";

export const getProfileHandler: RouteHandler<
  typeof getProfileRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const res = await ProfileActions.getProfile(db, profileId);
  return c.json({ data: res }, 200);
};

export const updateProfileHandler: RouteHandler<
  typeof updateProfileRoute,
  AppEnv
> = async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const payload = c.req.valid("json");
  const res = await ProfileActions.updateProfile(db, payload, profileId);
  return c.json({ data: res }, 200);
};
