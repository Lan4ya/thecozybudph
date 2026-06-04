import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { errorHandler } from "@shared/errors/errorHandler.ts";
import { ValidationError } from "@shared/errors/Errors.ts";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { defaultAppMiddlewares } from "@shared/middlewares/defaultMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { isDev } from "@shared/utils/isDev.ts";
import order from "./order-routes.ts";

export const app = new OpenAPIHono<AppEnv>({
  defaultHook: (result) => {
    if (!result.success) {
      throw new ValidationError(result.error);
    }
  },
}).basePath("order");

// Apply default middlewares
defaultAppMiddlewares(app);

// Serve the OpenAPI document
app.use("/order/doc/*", ...(isDev ? [] : [adminMiddleware()]));
app.get("/doc", (c) => {
  try {
    const document = app.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        title: "Order API",
        version: "1.0.0",
      },
    });

    return c.json(document);
  } catch (err: unknown) {
    // This logs the full stack trace directly into your server console
    console.error("[OpenAPI Spec Generation Failed]: ", err);

    // Return a verbose payload to your generation script during development
    return c.json(
      {
        error: "OPENAPI_GENERATION_FAILED",
        message:
          err instanceof Error
            ? err.message
            : "Unknown syntax or schema parsing error",
        stack: err instanceof Error ? err.stack : undefined,
      },
      500,
    );
  }
});

// Serve Swagger UI
app.get("/order/ui", swaggerUI({ url: "doc" }));

// Mount order routes
app.route("/", order);

// Handler Errors
app.onError((err) => errorHandler(err));
app.notFound((c) => c.text("Not Found", 404));

export default app;

if (import.meta.main) {
  Deno.serve(app.fetch);
}
