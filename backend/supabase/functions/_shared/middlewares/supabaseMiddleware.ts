import { createClient } from "supabase";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import type { Next } from "hono";

export const getSupabase = (c: Context) => c.get("supabase");

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = env(c);

    if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
    if (!SUPABASE_ANON_KEY) throw new Error("Missing SUPABASE_ANON_KEY");

    const authHeader = c.req.header("Authorization");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      },
    });
    // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    c.set("supabase", supabase);
    await next();
  };
};
