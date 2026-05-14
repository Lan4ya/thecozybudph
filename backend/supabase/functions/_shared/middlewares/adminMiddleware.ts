import { Context, Next } from "hono";
import { AppError } from "../errors/Errors.ts";
import { AppEnv } from "../types.d.ts";
import { requireVariables } from "../utils/mod.ts";

// Validates user admin status.
// Use this on routes that needs admin priviliges.
// Note: `authMiddleware` must run BEFORE this middleware to populate the 'isAdmin' variable.
export const adminMiddleware = () => {
  return async (c: Context<AppEnv>, next: Next) => {
    const { isAdmin } = requireVariables(c, "isAdmin");

    if (isAdmin === false) {
      throw AppError.forbidden(
        "Forbidden",
        "Non-admin attempted admin route access",
      );
    }

    await next();
  };
};
