import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { handleError } from "@shared/errors/errorHandler.ts";
import { ValidationError } from "@shared/errors/Errors.ts";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { defaultAppMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";
import { formatZodError } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { isDev } from "@shared/utils/isDev.ts";
import address from "./address-routes.ts";

const app = new OpenAPIHono<AppEnv>({
  defaultHook: (result) => {
    if (!result.success) {
      const errors = formatZodError(result.error);
      throw new ValidationError(errors);
    }
  },
}).basePath("address");

// Apply default middlewares
defaultAppMiddlewares(app);

// Serve the OpenAPI document
app.use("/doc/*", ...(isDev ? [] : [adminMiddleware()]));
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Address API",
    version: "1.0.0",
  },
});

// Serve Swagger UI
app.get("/ui", swaggerUI({ url: "doc" }));

// Mount address routes
app.route("/", address);

// Handler Errors
app.onError((err) => handleError(err));
app.notFound((c) => c.text("Not Found", 404));

export default app;

if (import.meta.main) {
  Deno.serve(app.fetch);
}
