import type { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "@shared/types.d.ts";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { secureHeaders } from "hono/secure-headers";
import { isDev } from "../utils/isDev.ts";
import { devRequestLogger } from "./logger.ts";
import { Context } from "hono";

// Sane default configs. Should be applied in the app before the routes.
export const defaultAppMiddlewares = (app: OpenAPIHono<AppEnv>) => {
  const APP_URL = Deno.env.get("APP_URL");

  if (isDev) {
    app.use(devRequestLogger());
  }

  app.use(logger());
  app.use(timing());

  app.use(
    "*",
    cors({
      origin: [APP_URL!],
      credentials: true,
      maxAge: 86400,
    }),
  );

  app.use("*", (c, next) => {
    const isSwaggerUI = c.req.path.includes("/ui");

    if (isSwaggerUI) {
      return next();
    }

    return secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        childSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        frameSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        manifestSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        reportTo: "endpoint-1",
        sandbox: ["allow-same-origin", "allow-scripts"],
        scriptSrcAttr: ["'none'"],
        styleSrcAttr: ["none"],
        styleSrcElem: ["'self'", "https:", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
        workerSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        scriptSrcElem: ["'self'"],
      },
    })(c, next);
  });

  // Utility to extract client IP address
  const getClientIp = (c: Context): string => {
    return (
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      c.req.header("x-real-ip") ||
      "anonymous"
    );
  };

  // ==========================================
  //  DEDICATED RATE LIMITING INSTANCES
  // ==========================================

  // Global/Default: 200 requests per 15 mins
  const globalLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-6",
    keyGenerator: (c) => `${getClientIp(c)}:global`,
    handler: (c) => {
      console.log(`[Rate Limit] Global limit hit: ${getClientIp(c)}`);
      return c.json(
        {
          message:
            "Too many requests, please wait a moment before trying again",
          code: "RATE_LIMIT",
        },
        429,
      );
    },
  });

  // Login: 15 requests per 30 mins
  const loginLimiter = rateLimiter({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-6",
    keyGenerator: (c) => `${getClientIp(c)}:login`,
    handler: (c) => {
      console.log(`[Rate Limit] Login limit hit: ${getClientIp(c)}`);
      return c.json(
        {
          message:
            "Too many login attempts, please wait a moment before trying again.",
          code: "RATE_LIMIT",
        },
        429,
      );
    },
  });

  // Signup: 5 requests per 1 hour
  const signupLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-6",
    keyGenerator: (c) => `${getClientIp(c)}:signup`,
    handler: (c) => {
      console.log(`[Rate Limit] Signup limit hit: ${getClientIp(c)}`);
      return c.json(
        {
          message:
            "Too many signup attempts, please wait a moment before trying again.",
          code: "RATE_LIMIT",
        },
        429,
      );
    },
  });

  // Expensive Auth Actions: 10 requests per 15 mins
  const strictAuthLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-6",
    keyGenerator: (c: Context) => `${getClientIp(c)}:auth-strict`,
    handler: (c: Context) => {
      console.log(
        `[Rate Limit] Strict Auth limit hit: ${getClientIp(c)} on ${c.req.path}`,
      );
      return c.json(
        {
          message:
            "Too many requests, please wait a moment before trying again.",
          code: "RATE_LIMIT",
        },
        429,
      );
    },
  });

  // Apply the global safety net to all incoming routes
  app.use("*", globalLimiter);

  // Bind strict rules to explicit route matching paths
  app.use("/login", loginLimiter);
  app.use("/signup", signupLimiter);

  // Catch-all strict limits for expensive mutation endpoints
  app.use("/password-reset", strictAuthLimiter);
  app.use("/resend-verification", strictAuthLimiter);
  app.use("/cooldown", strictAuthLimiter);
};
