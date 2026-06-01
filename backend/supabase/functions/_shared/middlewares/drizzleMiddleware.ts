import { Context, MiddlewareHandler, Next } from "hono";
import { createDrizzle } from "../db/client.ts";
import { AppEnv } from "../types.d.ts";

// Creates two drizzle client 'db.rls' which respects RLS policies and 'db.admin' which has full admin privileges.
export function drizzleMiddleware(): MiddlewareHandler {
  return async (c: Context<AppEnv>, next: Next) => {
    const token = c.get("claims");
    const db = createDrizzle(token);
    c.set("db", db);
    await next();
  };
}
