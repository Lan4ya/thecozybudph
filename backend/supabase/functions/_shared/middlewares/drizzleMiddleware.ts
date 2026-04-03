import { Context, Next } from "hono";
import { createDrizzle } from "../db/client.ts";
import { AppEnv } from "../types.d.ts";
import { requireVariables } from "../utils/hono.ts";

export function drizzleMiddleware() {
  return async (c: Context<AppEnv>, next: Next) => {
    const { claims } = requireVariables(c, "claims");

    // Not required unlike claims. Meaning calling adminMiddlware to verify
    // admin status before this middlware is optional and we can still access
    // db through db.rls
    const isAdmin = c.get("isAdmin");

    const db = createDrizzle(!!isAdmin, claims);

    c.set("db", db);
    await next();
  };
}
