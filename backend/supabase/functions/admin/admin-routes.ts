import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import { supabaseServiceMiddleware } from "@shared/middlewares/supabaseServiceMiddleware.ts";
import {
  adminQueryOrdersResponseSchema,
  adminQueryOrdersSchema,
  apiErrorResponseSchema,
  createProductResponseSchema,
  createProductSchema,
  deleteProductsResponseSchema,
  deleteProductsSchema,
  productIdSchema,
  updateProductResponseSchema,
  updateProductSchema,
  adminAnalyticsResponseSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  createProductHandler,
  deleteProductHandler,
  getOrdersHandler,
  updateProductHandler,
  getAnalyticsHandler,
} from "./admin-handlers.ts";

export const getAdminAnalyticsRoute = createRoute({
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

export const getAdminOrdersRoute = createRoute({
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
  tags: ["Admin"],
});

export const createProductRoute = createRoute({
  method: "post",
  path: "/product",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: createProductSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Create product",
      content: {
        "application/json": {
          schema: createProductResponseSchema,
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

export const updateProductRoute = createRoute({
  method: "patch",
  path: "/product/{id}",
  request: {
    params: productIdSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: updateProductSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Update product",
      content: {
        "application/json": {
          schema: updateProductResponseSchema,
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

export const deleteProductRoute = createRoute({
  method: "delete",
  path: "/product",
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteProductsSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Delete products",
      content: {
        "application/json": {
          schema: deleteProductsResponseSchema,
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

const admin = new OpenAPIHono<AppEnv>();

admin.openapi(getAdminAnalyticsRoute, getAnalyticsHandler);
admin.openapi(getAdminOrdersRoute, getOrdersHandler);
admin.openapi(createProductRoute, createProductHandler);
admin.openapi(updateProductRoute, updateProductHandler);
admin.openapi(deleteProductRoute, deleteProductHandler);

export default admin;
