import { OpenAPIHono } from "@hono/zod-openapi";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import {
  adminAnalyticsResponseSchema,
  apiErrorResponseSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import { getAnalyticsHandler } from "../admin-handlers.ts";

export const getAnalyticsRoute = createRoute({
  method: "get",
  path: "/analytics",
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get admin analytics",
      content: {
        "application/json": {
          schema: adminAnalyticsResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Admin"],
});

import { createRoute } from "@hono/zod-openapi";

export const registerAnalyticsRoutes = (admin: OpenAPIHono<AppEnv>) => {
  admin.openapi(getAnalyticsRoute, getAnalyticsHandler);
};
