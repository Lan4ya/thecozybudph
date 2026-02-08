import { Hono } from "hono";
import webhook from "./webhook-routes.ts";
import { handleError } from "@shared/middlewares/errorHandler.ts";
import { AppEnv } from "@shared/types.d.ts";
import { applyDefaultMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";

const app = new Hono<AppEnv>().basePath("webhook");

applyDefaultMiddlewares(app);

app.route("/", webhook);

app.onError((err) => handleError(err));
app.notFound((c) => c.text("Not Found", 404));

Deno.serve(app.fetch);
