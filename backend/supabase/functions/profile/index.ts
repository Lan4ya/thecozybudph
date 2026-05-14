import { Hono } from "hono";
import profile from "./profile-routes.ts";
import { handleError } from "@shared/errors/errorHandler.ts";
import { AppEnv } from "@shared/types.d.ts";
import { defaultAppMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";

const app = new Hono<AppEnv>().basePath("profile");

defaultAppMiddlewares(app);

app.route("/", profile);

app.onError((err) => handleError(err));
app.notFound((c) => c.text("Not Found", 404));

Deno.serve(app.fetch);
