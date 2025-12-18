import { getSupabase } from "./supabaseMiddleware.ts";
import { Context, Next } from "hono";
import { AppError } from "../errors/Errors.ts";

export const roleMiddleware = (...allowedRoles: [string, ...string[]]) => {
  if (!allowedRoles.length)
    throw AppError.internal("roleMiddleware requires roles");

  return async (c: Context, next: Next) => {
    const claims = c.get("claims");

    if (!claims) {
      // Human error, authMiddleware is what sets claims in the Context
      throw AppError.internal(
        "Failed to use roleMiddleware: authMiddleware must be applied before using this middleware",
      );
    }

    const supabase = getSupabase(c);

    // NOTE: extract this logic using profiles repository later on
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", claims.sub)
      .single();

    if (profileError) {
      throw AppError.internal(
        `Failed to get profile role: ${profileError.message}`,
      );
    }

    if (!allowedRoles.includes(profile.role)) {
      throw AppError.forbidden();
    }

    c.set("role", profile.role);
    await next();
  };
};
