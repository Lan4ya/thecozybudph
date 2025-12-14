import { getSupabase } from "./supabaseMiddleware.ts";
import { Context, Next } from "hono";
import { CustomError } from "../errors/mod.ts";
import { isDev } from "../utils/isDev.ts";

export const adminRoleMiddleware = () => {
  return async (c: Context, next: Next) => {
    const claims = c.get("claims");

    if (!claims) {
      // Programmer error: authMiddleware not applied before calling this middleware
      throw CustomError.unauthorized("authMiddleware required");
    }
    const supabase = getSupabase(c);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", claims.sub)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "admin") {
      if (isDev) {
        throw CustomError.forbidden(
          `${profileError?.message ?? "Unauthorized"}`,
        );
      }

      throw CustomError.forbidden("Unauthorized");
    }

    await next();
  };
};
