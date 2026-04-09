import type { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { AppEnv } from "../types.d.ts";
import { isDev } from "../utils/isDev.ts";
import { devRequestLogger } from "./logger.ts";

const APP_URL = Deno.env.get("APP_URL");

// Apply sane default middlewares on all routes on all edge functions.
export function applyDefaultMiddlewares(app: Hono<AppEnv>) {
  if (isDev) {
    app.use("*", devRequestLogger);
  }

  app.use(logger());

  app.use(
    "*",
    cors({
      origin: [
        "http://127.0.0.1:5173", // dev only
        APP_URL!,
      ],
      credentials: true,
      maxAge: 86400,
    }),
  );

  app.use(
    secureHeaders({
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
        // reportUri: "/csp-report",
        sandbox: ["allow-same-origin", "allow-scripts"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        scriptSrcElem: ["'self'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        styleSrcAttr: ["none"],
        styleSrcElem: ["'self'", "https:", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
        workerSrc: ["'self'"],
      },
    }),
  );

  app.use(
    "*",
    rateLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 200,
      standardHeaders: "draft-6",
      keyGenerator: (c) =>
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "anonymous",
    }),
  );
}
