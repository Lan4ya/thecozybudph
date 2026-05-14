import type { MiddlewareHandler } from "hono";
import type { DrizzleClient } from "@shared/db/client.ts";

export function fakeAuthMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    c.set("claims", {
      sub: crypto.randomUUID(),
      role: "authenticated",
    });
    c.set("isAdmin", true);
    await next();
  };
}

export function fakeAdminMiddleware(): MiddlewareHandler {
  return async (_c, next) => {
    await next();
  };
}

export function testDrizzleMiddleware(db: DrizzleClient): MiddlewareHandler {
  return async (c, next) => {
    c.set("db", db);
    await next();
  };
}
