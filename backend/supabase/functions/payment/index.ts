import { Hono } from "hono";
import payment from "./payment-routes.ts";
import { handleError } from "@shared/errors/errorHandler.ts";
import { AppEnv } from "@shared/types.d.ts";
import { applyDefaultMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";

const app = new Hono<AppEnv>().basePath("payment");

applyDefaultMiddlewares(app);

app.route("/", payment);

app.onError((err) => handleError(err));
app.notFound((c) => c.text("Not Found", 404));

Deno.serve(app.fetch);
