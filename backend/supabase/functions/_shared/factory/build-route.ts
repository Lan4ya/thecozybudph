import {
  adminMiddleware,
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
  supabaseServiceMiddleware,
} from "@shared/middlewares/mod.ts";

import { Hono, MiddlewareHandler } from "hono";
import { AppEnv } from "../types.d.ts";

export const middlewareRegistry = {
  auth: authMiddleware,
  admin: adminMiddleware,
  drizzle: drizzleMiddleware,
  supabase: supabaseMiddleware,
  supabaseService: supabaseServiceMiddleware,
};

type MiddlewareKey = keyof typeof middlewareRegistry;

type BuildRouteOptions = {
  middlewares?: MiddlewareKey[];
  overrides?: Partial<Record<MiddlewareKey, MiddlewareHandler>>;
};

export function buildRoute(options?: BuildRouteOptions) {
  const app = new Hono<AppEnv>();

  const middlewareHandlers =
    options?.middlewares?.map((key) => {
      return options.overrides?.[key] ?? middlewareRegistry[key]();
    }) ?? [];

  if (middlewareHandlers.length) {
    app.use("*", ...middlewareHandlers);
  }

  return app;
}
