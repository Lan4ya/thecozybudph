/*
For local dev, this is an example on how you'd make a GET request.

 curl -i -L --request GET 'http://127.0.0.1:54321/functions/v1/products' \
   --header 'Authorization: Bearer {token}' \
   --header 'Content-Type: application/json' \

the token TTL is set to 1 week in config.toml, as to not worry about refreshing
it repeatedly while developing the app. In prod the token has 1hr TTl
*/

import { Hono } from "hono";
import product from "./routes.ts";
import { handleError } from "@shared/middlewares/errorHandler.ts";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono().basePath("product");

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

app.route("/", product);

app.notFound((c) => c.text("Not Found", 404));
app.onError((err) => handleError(err));

Deno.serve(app.fetch);
