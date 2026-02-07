import { AppError } from "../errors/Errors.ts";
import { AppEnv } from "../types.d.ts";
import { Context, Next } from "hono";

export const adminMiddleware = () => {
  return async (c: Context<AppEnv>, next: Next) => {
    const claims = c.get("claims");

    if (!claims) {
      // authMiddleware contract violation
      throw AppError.internal(
        "Internal server error",
        "adminMiddleware requires authMiddleware to run first to properly verify the token",
      );
    }

    // How this works is that app_metadata can be customized either through direct sql or supabase.auth.admin()
    // and only the admin account has the app_metadata.role set to admin set to it's JwtPayload, every other account doesn't.
    const role = claims.app_metadata?.role;

    if (!role || role !== "admin") {
      throw AppError.forbidden();
    }

    c.set("role", role);
    await next();
  };
};
