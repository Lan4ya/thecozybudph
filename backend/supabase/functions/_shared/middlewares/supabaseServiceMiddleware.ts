import { createClient } from "supabase";
import { env } from "hono/adapter";
import type { Context, Next } from "hono";
import type { Database } from "../schema/index.ts";
import { AppError } from "../errors/Errors.ts";
import { AppEnv } from "../types.d.ts";

// WARN: This supabase instance/middleware uses the SUPABASE_SERVICE_ROLE_KEY which bypasses all RLS security in Supabase DB.
// DO NOT use this on routes that shoudn't execute admin previleges (use getSupabase() for such cases). And if
// you do use it route's that needs admin previleges, always check the user's role if admin using roleMiddleware()
export const supabaseServiceMiddleware =
  () => async (c: Context, next: Next) => {
    const role = c.get("role");
    if (role !== "admin")
      throw AppError.forbidden(
        "Failed to use supabase service role: Forbidden",
      );

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env(c);

    const url = SUPABASE_URL;
    const key = SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) throw new Error("Supabase url or key is missing");

    c.set("supabaseService", createClient<Database>(url, key));
    await next();
  };
