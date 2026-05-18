import { Database } from "@shared/schemas/index.ts";
import type { Context, MiddlewareHandler, Next } from "hono";
import { createClient } from "supabase";
import { requireBindings } from "../utils/mod.ts";

// Creates a supabase instance that respects supabase RLS policies.
export const supabaseMiddleware =
  (): MiddlewareHandler => async (c: Context, next: Next) => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = requireBindings(
      c,
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
    );

    const authHeader = c.req.header("Authorization");

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    c.set("supabase", supabase);
    await next();
  };
