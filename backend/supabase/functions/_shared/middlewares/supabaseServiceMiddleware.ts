import { createClient } from "supabase";
import { env } from "hono/adapter";
import type { Context, Next } from "hono";
import type { Database } from "../types/index.ts";
import { AppError } from "../errors/Errors.ts";
import { AppEnv } from "../types.d.ts";

// WARN: This supabase instance/middleware uses the SUPABASE_SERVICE_ROLE_KEY which bypasses all RLS security in Supabase DB.
// DO NOT use this on routes that shoudn't execute admin previleges (use getSupabase() for such cases). And if
// you do use it route's that needs admin previleges, always check the user's role if admin using adminMiddleware()
export const supabaseServiceMiddleware =
  () => async (c: Context<AppEnv>, next: Next) => {
    const isAdmin = c.get("isAdmin");
    if (!isAdmin)
      throw AppError.forbidden("Forbidden", "Insufficient privileges");

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env(c);

    if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
    if (!SUPABASE_SERVICE_ROLE_KEY)
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    c.set(
      "supabaseService",
      createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY),
    );
    await next();
  };
