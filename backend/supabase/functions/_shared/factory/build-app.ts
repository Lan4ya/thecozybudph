import { handleError } from "@shared/errors/errorHandler.ts";
import { defaultAppMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";
import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "../types.d.ts";

export function buildApp(basePath: string, routes: any) {
  const app = new OpenAPIHono<AppEnv>().basePath(basePath);

  // Apply default middlewares/configs
  defaultAppMiddlewares(app);

  app.route("/", routes);
  app.onError((err) => handleError(err));
  app.notFound((c) => c.text("Not Found", 404));

  return app;
}
