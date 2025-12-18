import { getSupabase } from "./supabaseMiddleware.ts";
import { Context, Next } from "hono";
import { CustomError } from "../errors/mod.ts";

export const roleMiddleware = (...allowedRoles: [string, ...string[]]) => {
  return async (c: Context, next: Next) => {
    const claims = c.get("claims");

    if (!claims) {
      // Human error, authMiddleware is what sets claims in the Context
      throw CustomError.unauthorized(
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
      throw CustomError.internal(
        `Failed to get profile role: ${profileError.message}`,
      );
    }

    if (!allowedRoles.includes(profile.role)) {
      throw CustomError.forbidden();
    }

    c.set("role", profile.role);
    await next();
  };
};
