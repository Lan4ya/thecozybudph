import type { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "@shared/types.d.ts";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { isDev } from "../utils/isDev.ts";
import { devRequestLogger } from "./logger.ts";

// Sane default configs. Should be applied in the app before the routes.
export const defaultAppMiddlewares = (app: OpenAPIHono<AppEnv>) => {
  const APP_URL = Deno.env.get("APP_URL");

  if (isDev) {
    app.use("*", devRequestLogger());
  }

  app.use(logger());

  app.use(
    "*",
    cors({
      origin: [
        "http://127.0.0.1:5173", // dev
        APP_URL!,
      ],
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
};
