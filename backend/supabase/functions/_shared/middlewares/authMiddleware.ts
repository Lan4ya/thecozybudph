import { Context } from "hono";
import { Next } from "hono";
import { AppError } from "../errors/Errors.ts";
import { isDev } from "../utils/isDev.ts";
import { AppEnv } from "../types.d.ts";
import { JwtPayload } from "supabase";
import { requireVariables } from "../utils/hono.ts";

// Use this on all routes that should require authenticated users
export const authMiddleware = () => async (c: Context<AppEnv>, next: Next) => {
  const { supabase } = requireVariables(c, "supabase");

  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  const { data, error } = await supabase.auth.getClaims(token);
  const claims: JwtPayload | undefined = data?.claims;

  isDev && console.log("claims: ", claims);

  if (error || !claims) {
    throw AppError.unauthorized(
      error?.message ? error.message : "Invalid token",
    );
  }

  if (claims.exp && claims.exp < Date.now() / 1000) {
    throw AppError.unauthorized("Token expired");
  }

  c.set("claims", claims);
  await next();
};
