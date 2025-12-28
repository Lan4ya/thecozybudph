import { AppError } from "../errors/Errors.ts";
import { AppEnv } from "../types.d.ts";
import { Context, Next } from "hono";

export const roleMiddleware = (
  ...allowedRoles: ["user" | "admin", ...("user" | "admin")[]]
) => {
  if (!allowedRoles.length) {
    throw AppError.internal("roleMiddleware requires roles");
  }

  return async (c: Context<AppEnv>, next: Next) => {
    const claims = c.get("claims");

    if (!claims) {
      // authMiddleware contract violation
      throw AppError.internal(
        "roleMiddleware requires authMiddleware to run first",
      );
    }

    const supabase = c.get("supabase");

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", claims.sub)
      .single();

    if (error) {
      throw AppError.internal(`Failed to get profile role: ${error.message}`);
    }

    if (!allowedRoles.includes(profile.role)) {
      throw AppError.forbidden();
    }

    c.set("role", profile.role);
    await next();
  };
};
