import type { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "@shared/types.d.ts";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { isDev } from "../utils/isDev.ts";
import { devRequestLogger } from "./logger.ts";
import { rateLimitWithPostgresFallback } from "@shared/middlewares/rateLimitMiddleware.ts";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

  // ------------------------------------------------------------------
  // Upstash rate limiter instances
  // ------------------------------------------------------------------

  // Global: 200 requests per 15 minutes
  const globalLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "15 m"),
    ephemeralCache: new Map(),
  });

  // Login: 10 requests per 30 minutes
  const loginLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "30 m"),
    ephemeralCache: new Map(),
  });

  // Signup: 5 requests per 1 hour
  const signupLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    ephemeralCache: new Map(),
  });

  // Expensive Auth Actions: 10 requests per 15 minutes
  const strictAuthLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    ephemeralCache: new Map(),
  });

  // Global safety net – every route first hits this
  app.use(
    "*",
    rateLimitWithPostgresFallback({
      upstashLimiter: globalLimiter,
      keyPrefix: "global",
      message: "Too many requests, wait a moment before trying again",
      windowMs: 15 * 60 * 1000,
      maxRequest: 200,
    }),
  );

  // Auth‑related endpoints with stricter limits
  app.use(
    "/login",
    rateLimitWithPostgresFallback({
      upstashLimiter: loginLimiter,
      keyPrefix: "login",
      message: "Too many login attempts, wait a moment before trying again.",
      windowMs: 30 * 60 * 1000,
      maxRequest: 10,
    }),
  );

  app.use(
    "/signup",
    rateLimitWithPostgresFallback({
      upstashLimiter: signupLimiter,
      keyPrefix: "signup",
      message: "Too many signup attempts, wait a moment before trying again.",
      windowMs: 60 * 60 * 1000,
      maxRequest: 5,
    }),
  );

  const strictAuthMessage =
    "Too many requests, wait a moment before trying again.";

  app.use(
    "/password-reset",
    rateLimitWithPostgresFallback({
      upstashLimiter: strictAuthLimiter,
      keyPrefix: "auth-strict",
      message: strictAuthMessage,
      windowMs: 15 * 60 * 1000,
      maxRequest: 10,
    }),
  );

  app.use(
    "/resend-verification",
    rateLimitWithPostgresFallback({
      upstashLimiter: strictAuthLimiter,
      keyPrefix: "auth-strict",
      message: strictAuthMessage,
      windowMs: 15 * 60 * 1000,
      maxRequest: 10,
    }),
  );
};
