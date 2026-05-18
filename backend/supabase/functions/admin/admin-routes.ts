import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import { supabaseServiceMiddleware } from "@shared/middlewares/supabaseServiceMiddleware.ts";
import {
  adminCancelShipOrderResponseSchema,
  adminQueryOrdersResponseSchema,
  adminQueryOrdersSchema,
  adminShipOrderResponseSchema,
  adminShipOrderSchema,
  createProductResponseSchema,
  createProductSchema,
  deleteProductsResponseSchema,
  deleteProductsSchema,
  errorResponseSchema,
  getShippingOrderResponseSchema,
  productIdSchema,
  updateProductResponseSchema,
  updateProductSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  cancelShipOrderHandler,
  createProductHandler,
  deleteProductHandler,
  getOrdersHandler,
  getShippingOrderHandler,
  shipOrderHandler,
  updateProductHandler,
} from "./admin-handlers.ts";

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
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
  tags: ["Admin"],
});

export const shipOrderRoute = createRoute({
  method: "patch",
  path: "/order/{id}/shipment",
  request: {
    params: uuidParamSchema("id"),
    body: {
      content: {
        "application/json": {
          schema: adminShipOrderSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Ship order",
      content: {
        "application/json": {
          schema: adminShipOrderResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
  tags: ["Admin"],
});

export const getShippingOrderRoute = createRoute({
  method: "get",
  path: "/order/{id}/shipment",
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
      description: "Get shipping order details",
      content: {
        "application/json": {
          schema: getShippingOrderResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
  tags: ["Admin"],
});

export const cancelShipOrderRoute = createRoute({
  method: "delete",
  path: "/order/{id}/shipment",
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
      description: "Cancel ship order",
      content: {
        "application/json": {
          schema: adminCancelShipOrderResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: errorResponseSchema,
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
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: errorResponseSchema,
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
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: errorResponseSchema,
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
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
  tags: ["Admin"],
});

const admin = new OpenAPIHono<AppEnv>();

admin.openapi(getAdminOrdersRoute, getOrdersHandler);
admin.openapi(shipOrderRoute, shipOrderHandler);
admin.openapi(getShippingOrderRoute, getShippingOrderHandler);
admin.openapi(cancelShipOrderRoute, cancelShipOrderHandler);
admin.openapi(createProductRoute, createProductHandler);
admin.openapi(updateProductRoute, updateProductHandler);
admin.openapi(deleteProductRoute, deleteProductHandler);

export default admin;
