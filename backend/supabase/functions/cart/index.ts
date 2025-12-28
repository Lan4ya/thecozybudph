import { Hono } from "hono";
import cart from "./cart-routes.ts";
import { handleError } from "@shared/middlewares/errorHandler.ts";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";
import { AppEnv } from "@shared/types.d.ts";

const app = new Hono<AppEnv>().basePath("cart");

app.use(logger());
app.use(
  "*",
  cors({
    origin: [
      "http://127.0.0.1:5173", // dev
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
    windowMs: 15 * 60 * 1000, // 15mins
    limit: 200, // Limit each IP to N requests per `window`
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      return (
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "anonymous"
      );
    },
  }),
);

app.route("/", cart);

app.onError((err) => handleError(err));
app.notFound((c) => c.text("Not Found", 404));

Deno.serve(app.fetch);
