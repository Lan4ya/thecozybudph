import { handleError } from "@shared/errors/errorHandler.ts";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { devRequestLogger } from "../middlewares/mod.ts";
import { AppEnv } from "../types.d.ts";
import { buildRoute } from "./build-route.ts";
import { isDev } from "../utils/mod.ts";

export function buildApp(
  basePath: string,
  routes: ReturnType<typeof buildRoute>,
) {
  const app = new Hono<AppEnv>().basePath(basePath);

  if (isDev) {
    app.use("*", devRequestLogger());
  }

  app.use(logger());

  app.use(
    "*",
    cors({
      origin: [
        "http://127.0.0.1:5173", // dev
        Deno.env.get("APP_URL")!, // prod
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

  app.route("/", routes);
  app.onError((err) => handleError(err));
  app.notFound((c) => c.text("Not Found", 404));

  return app;
}
