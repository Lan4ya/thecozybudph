import { createClient, SupabaseClient } from "supabase";
import { isDev } from "../utils/isDev.ts";
import { env } from "hono/adapter";
import type { Context } from "hono";
import type { Database } from "../schema/index.ts";

// WARN: This supabase instance uses the SUPABASE_SERVICE_ROLE_KEY which bypasses all RLS security in Supabase DB.
// DO NOT use this on routes that shoudn't execute admin previleges (use getSupabase() for such cases). And if
// you do use it route's that needs admin previleges, always check that the user's role
// is of an admin using adminRoleMiddleware()

export const getSupabaseServiceRole = (c: Context): SupabaseClient => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env(c);

  const url = SUPABASE_URL;
  const key = SUPABASE_SERVICE_ROLE_KEY;

  if (isDev) {
    const allEnv = env(c);
    console.log({ allEnv });
    console.log({ url, key });
  }

  if (!url || !key) throw new Error("Supabase env not set");

  console.log({ url, key });

  return createClient<Database>(url, key);
};
