import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import {
  adminGetOrderResponseSchema,
  adminQueryOrdersResponseSchema,
  adminQueryOrdersSchema,
  apiErrorResponseSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import { getOrderHandler, queryOrdersHandler } from "../admin-handlers.ts";

export const getOrderRoute = createRoute({
  method: "get",
  path: "/order/{id}",
  request: {
    params: uuidParamSchema("id"),
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get admin dashboard order",
      content: {
        "application/json": {
          schema: adminGetOrderResponseSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
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
  tags: ["Admin", "Order"],
});

export const queryOrdersRoute = createRoute({
  method: "get",
  path: "/order",
  request: {
    query: adminQueryOrdersSchema,
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get admin orders",
      content: {
        "application/json": {
          schema: adminQueryOrdersResponseSchema,
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
  tags: ["Admin", "Order"],
});

export const registerOrderRoutes = (admin: OpenAPIHono<AppEnv>) => {
  admin.openapi(queryOrdersRoute, queryOrdersHandler);
  admin.openapi(getOrderRoute, getOrderHandler);
};
