import { RouteHandler } from "@hono/zod-openapi";
import { AuthActions } from "@shared/modules/auth/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { isDev, requireBindings, requireVariables } from "@shared/utils/mod.ts";
import {
  loginRoute,
  requestPasswordResetRoute,
  resendVerificationRoute,
  signupRoute,
} from "./auth-routes.ts";

export const signupHandler: RouteHandler<typeof signupRoute, AppEnv> = async (
  c,
) => {
  const { email, password, cfTurnstileToken } = c.req.valid("json");
  const { supabase } = requireVariables(c, "supabase");
  const { APP_URL } = requireBindings(c, "APP_URL");
  const clientIp = c.req.header("x-forwarded-for") ?? undefined;
  const data = await AuthActions.signup(supabase, clientIp, APP_URL, {
    email,
    password,
    cfTurnstileToken,
  });
  isDev && console.log(data);
  return c.json({ data }, 200);
};

export const loginHanndler: RouteHandler<typeof loginRoute, AppEnv> = async (
  c,
) => {
  const { email, password, cfTurnstileToken } = c.req.valid("json");
  const { supabase } = requireVariables(c, "supabase");
  const clientIp = c.req.header("x-forwarded-for") ?? undefined;
  const data = await AuthActions.login(supabase, clientIp, {
    email,
    password,
    cfTurnstileToken,
  });
  isDev && console.log(data);
  return c.json({ data }, 200);
};

export const passwordResetHandler: RouteHandler<
  typeof requestPasswordResetRoute,
  AppEnv
> = async (c) => {
  const { email, cfTurnstileToken } = c.req.valid("json");
  const { db, supabase } = requireVariables(c, "db", "supabase");
  const clientIp = c.req.header("x-forwarded-for") ?? undefined;
  const data = await AuthActions.requestPasswordReset(
    db,
    supabase,
    email,
    cfTurnstileToken,
    clientIp,
  );
  isDev && console.log(data);
  return c.json({ data }, 200);
};

export const resendEmailVerificationHandler: RouteHandler<
  typeof resendVerificationRoute,
  AppEnv
> = async (c) => {
  const { email } = c.req.valid("json");
  const { db, supabase } = requireVariables(c, "db", "supabase");
  const data = await AuthActions.resendEmailVerification(db, supabase, email);
  isDev && console.log(data);
  return c.json({ data }, 200);
};
