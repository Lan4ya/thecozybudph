import { Context } from "hono";
import { Next } from "hono";
import { AppError } from "../errors/Errors.ts";
import { AppEnv } from "../types.d.ts";
import { JwtPayload } from "supabase";
import { requireVariables } from "../utils/mod.ts";
import { MiddlewareHandler } from "hono";

// Validates user auth.
// Note: `supabaseMiddleware` must run BEFORE this middleware to populate the supabase client variable.
export const authMiddleware =
  (): MiddlewareHandler => async (c: Context<AppEnv>, next: Next) => {
    const { supabase } = requireVariables(c, "supabase");

    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Missing or malformed Authorization header");
    }

    const token = authHeader?.split(" ")[1];

    // Validate token
    const { data, error } = await supabase.auth.getClaims(token);
    const claims: JwtPayload | undefined = data?.claims;

    // isDev && console.log("claims: ", claims);

    if (error || !claims) {
      throw AppError.unauthorized(
        error?.message ? error.message : "Invalid token",
      );
    }

    // This is just fallback. supabase already throws an err if token is expired
    if (claims.exp && claims.exp < Date.now() / 1000) {
      throw AppError.unauthorized("Token expired");
    }

    // Check user admin status:
    // How this works is that app_metadata can be customized either through direct sql or supabase.auth.admin()
    // and only the admin account has the app_metadata.role set to admin set to it's JwtPayload, every other account doesn't.
    const role = claims.app_metadata?.role as "admin" | null;

    if (role === "admin") {
      c.set("isAdmin", true);
    } else {
      c.set("isAdmin", false);
    }

    c.set("claims", claims);
    await next();
  };
