import { createClient } from "supabase";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import type { Next } from "hono";
import { Database } from "../core/index.ts";

export const supabaseMiddleware =
  (): MiddlewareHandler => async (c: Context, next: Next) => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = env(c);

    if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
    if (!SUPABASE_ANON_KEY) throw new Error("Missing SUPABASE_ANON_KEY");

    const authHeader = c.req.header("Authorization");

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      },
    });

    c.set("supabase", supabase);
    await next();
  };
