import { Context, Next } from "hono";
import { AppError } from "../errors/Errors.ts";
import { AppEnv } from "../types.d.ts";
import { requireVariables } from "../utils/hono.ts";

// Use this on all routes that should require admin priviliges
export const adminMiddleware = () => {
  return async (c: Context<AppEnv>, next: Next) => {
    const { claims } = requireVariables(c, "claims");

    // How this works is that app_metadata can be customized either through direct sql or supabase.auth.admin()
    // and only the admin account has the app_metadata.role set to admin set to it's JwtPayload, every other account doesn't.
    const role = claims.app_metadata?.role as "admin" | null;

    if (role !== "admin") {
      throw AppError.forbidden(
        "Forbidden",
        "adminMiddleware error: Insufficient priviliges",
      );
    }

    c.set("isAdmin", true);
    await next();
  };
};
