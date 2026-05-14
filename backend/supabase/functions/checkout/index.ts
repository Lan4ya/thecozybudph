import { Hono } from "hono";
import checkout from "./checkout-routes.ts";
import { handleError } from "@shared/errors/errorHandler.ts";
import { AppEnv } from "@shared/types.d.ts";
import { defaultAppMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";

const app = new Hono<AppEnv>().basePath("checkout");

defaultAppMiddlewares(app);

app.route("/", checkout);

app.onError((err) => handleError(err));
app.notFound((c) => c.text("Not Found", 404));

Deno.serve(app.fetch);
