import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import {
  addShippingOrderPriorityFeeSchema,
  apiErrorResponseSchema,
  cancelShipOrderResponseSchema,
  changeShippingDriverSchema,
  createShippingQuoteResponseSchema,
  createShippingQuoteSchema,
  editShippingOrderSchema,
  getShippingCitySchema,
  getShippingDriverSchema,
  getShippingOrderResponseSchema,
  shipOrderResponseSchema,
  shipOrderSchema,
  uuidParamSchema,
  addShippingOrderPriorityFeeResponseSchema,
  getShippingDriverResponseSchema,
  getShippingCityResponseSchema,
  getShippingMarketResponseSchema,
  editShippingOrderResponseSchema,
} from "@shared/schemas/index.ts";
import { z } from "zod";
import { AppEnv } from "@shared/types.d.ts";
import {
  addShippingOrderPriorityFeeHandler,
  cancelShipOrderHandler,
  changeShippingDriverHandler,
  createShippingQuoteHandler,
  editShippingOrderHandler,
  getShippingCityHandler,
  getShippingDriverHandler,
  getShippingMarketHandler,
  getShippingOrderHandler,
  shipOrderHandler,
} from "./shipment-handlers.ts";

export const shipOrderRoute = createRoute({
  method: "patch",
  path: "/order/{id}/shipment",
  request: {
    params: uuidParamSchema("id"),
    body: {
      content: {
        "application/json": {
          schema: shipOrderSchema,
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
          schema: shipOrderResponseSchema,
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

export const getShippingOrderRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.string().trim().min(1),
    }),
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get shipment order details",
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
  tags: ["Shipment"],
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
          schema: cancelShipOrderResponseSchema,
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

export const createShippingQuoteRoute = createRoute({
  method: "post",
  path: "/quotes",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createShippingQuoteSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Create shipment quotes",
      content: {
        "application/json": {
          schema: createShippingQuoteResponseSchema,
        },
      },
    },
    422: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Shipment"],
});

export const addShippingOrderPriorityFeeRoute = createRoute({
  method: "post",
  path: "/order/priority-fee",
  request: {
    body: {
      content: {
        "application/json": {
          schema: addShippingOrderPriorityFeeSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Add priority fee",
      content: {
        "application/json": {
          schema: addShippingOrderPriorityFeeResponseSchema,
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
  },
  tags: ["Admin"],
});

export const getShippingDriverRoute = createRoute({
  method: "get",
  path: "/driver",
  request: {
    query: getShippingDriverSchema,
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get shipping driver",
      content: {
        "application/json": {
          schema: getShippingDriverResponseSchema,
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
  },
  tags: ["Admin"],
});

export const changeShippingDriverRoute = createRoute({
  method: "post",
  path: "/driver/change",
  request: {
    body: {
      content: {
        "application/json": {
          schema: changeShippingDriverSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Change shipping driver",
      content: {
        "application/json": {
          schema: getShippingDriverResponseSchema,
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
  },
  tags: ["Admin"],
});

export const getShippingCityRoute = createRoute({
  method: "get",
  path: "/city/{cityId}",
  request: {
    params: getShippingCitySchema,
  },
  responses: {
    200: {
      description: "Get shipping city",
      content: {
        "application/json": {
          schema: getShippingCityResponseSchema,
        },
      },
    },
  },
  tags: ["Shipment"],
});

export const getShippingMarketRoute = createRoute({
  method: "get",
  path: "/market",
  responses: {
    200: {
      description: "Get shipping market",
      content: {
        "application/json": {
          schema: getShippingMarketResponseSchema,
        },
      },
    },
  },
  tags: ["Shipment"],
});

export const editShippingOrderRoute = createRoute({
  method: "patch",
  path: "/order/edit",
  request: {
    body: {
      content: {
        "application/json": {
          schema: editShippingOrderSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Edit shipping order",
      content: {
        "application/json": {
          schema: editShippingOrderResponseSchema,
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
  },
  tags: ["Admin"],
});

const shipment = new OpenAPIHono<AppEnv>();

shipment.openapi(shipOrderRoute, shipOrderHandler);
shipment.openapi(getShippingOrderRoute, getShippingOrderHandler);
shipment.openapi(cancelShipOrderRoute, cancelShipOrderHandler);
shipment.openapi(createShippingQuoteRoute, createShippingQuoteHandler);
shipment.openapi(
  addShippingOrderPriorityFeeRoute,
  addShippingOrderPriorityFeeHandler,
);
shipment.openapi(getShippingDriverRoute, getShippingDriverHandler);
shipment.openapi(changeShippingDriverRoute, changeShippingDriverHandler);
shipment.openapi(getShippingCityRoute, getShippingCityHandler);
shipment.openapi(getShippingMarketRoute, getShippingMarketHandler);
shipment.openapi(editShippingOrderRoute, editShippingOrderHandler);

export { shipment };
