import { Hono } from "hono";
import cart from "./cart-routes.ts";
import { handleError } from "@shared/errors/errorHandler.ts";
import { AppEnv } from "@shared/types.d.ts";
import { defaultAppMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";

const app = new Hono<AppEnv>().basePath("cart");

defaultAppMiddlewares(app);

app.route("/", cart);

app.onError((err) => handleError(err));
app.notFound((c) => c.text("Not Found", 404));

Deno.serve(app.fetch);
