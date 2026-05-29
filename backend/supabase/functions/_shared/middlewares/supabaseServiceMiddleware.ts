import type { Context, Next } from "hono";
import { MiddlewareHandler } from "hono";
import { createClient } from "supabase";
import { Database } from "../schemas/index.ts";
import { AppEnv } from "../types.d.ts";
import { requireBindings } from "../utils/mod.ts";

// Creates a supabase instance that has full admin privileges.
export const supabaseServiceMiddleware =
  (): MiddlewareHandler => async (c: Context<AppEnv>, next: Next) => {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = requireBindings(
      c,
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    const supabaseService = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    c.set("supabaseService", supabaseService);
    await next();
  };
