// IMPORTANT: getClaims() only verifies the jwt token and doesn't guarantee
// user still exists in DB!. use getUser() for that task. Only use this for
// read-only operations or caching

import { Context } from "hono";
import { Next } from "hono";
import { AppError } from "../errors/Errors.ts";
// import { isDev } from "../utils/isDev.ts";

export const authMiddleware = () => async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  const token = authHeader?.split(" ")[1];

  const supabase = c.get("supabase");
  const { data, error } = await supabase.auth.getClaims(token);
  const claims = data?.claims;

  // isDev && console.log("claims: ", claims);

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
