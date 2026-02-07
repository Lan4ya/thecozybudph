import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import type { Hono } from "hono";
import { AppEnv } from "../types.d.ts";
import { isDev } from "../utils/isDev.ts";
import { devRequestLogger } from "./logger.ts";

// Apply sane default middlewares on all edge functions
export function applyDefaultMiddlewares(app: Hono<AppEnv>) {
  if (isDev) {
    app.use("*", devRequestLogger());
  }

  app.use(logger());

  app.use(
    "*",
    cors({
      origin: [
        "http://127.0.0.1:5173", // dev only
        "https://thecozybudph.com",
        "https://thecozybudph.vercel.app",
      ],
      credentials: true,
      maxAge: 86400,
    }),
  );

  app.use(secureHeaders());

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
