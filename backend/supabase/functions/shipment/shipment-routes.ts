import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import {
  apiErrorResponseSchema,
  // cancelShipOrderResponseSchema,
  createShippingQuoteResponseSchema,
  createShippingQuoteSchema,
  getShippingOrderResponseSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  // cancelShipOrderHandler,
  createShippingQuoteHandler,
  getShippingOrderHandler,
} from "./shipment-handlers.ts";

// export const shipOrderRoute = createRoute({
//   method: "patch",
//   path: "/order/{id}/shipment",
//   request: {
//     params: uuidParamSchema("id"),
//     body: {
//       content: {
//         "application/json": {
//           schema: shipOrderSchema,
//         },
//       },
//     },
//   },
//   middleware: [
//     supabaseMiddleware(),
//     authMiddleware(),
//     adminMiddleware(),
//     drizzleMiddleware(),
//   ] as const,
//   responses: {
//     200: {
//       description: "Ship order",
//       content: {
//         "application/json": {
//           schema: shipOrderResponseSchema,
//         },
//       },
//     },
//     401: {
//       description: "Unauthorized",
//       content: {
//         "application/json": {
//           schema: apiErrorResponseSchema,
//         },
//       },
//     },
//     403: {
//       description: "Forbidden",
//       content: {
//         "application/json": {
//           schema: apiErrorResponseSchema,
//         },
//       },
//     },
//   },
//   tags: ["Admin"],
// });

export const getShippingOrderRoute = createRoute({
  method: "get",
  path: "/{id}",
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

// export const cancelShipOrderRoute = createRoute({
//   method: "delete",
//   path: "/order/{id}/shipment",
//   request: {
//     params: uuidParamSchema("id"),
//   },
//   middleware: [
//     supabaseMiddleware(),
//     authMiddleware(),
//     adminMiddleware(),
//     drizzleMiddleware(),
//   ] as const,
//   responses: {
//     200: {
//       description: "Cancel ship order",
//       content: {
//         "application/json": {
//           schema: cancelShipOrderResponseSchema,
//         },
//       },
//     },
//     401: {
//       description: "Unauthorized",
//       content: {
//         "application/json": {
//           schema: apiErrorResponseSchema,
//         },
//       },
//     },
//     403: {
//       description: "Forbidden",
//       content: {
//         "application/json": {
//           schema: apiErrorResponseSchema,
//         },
//       },
//     },
//   },
//   tags: ["Admin"],
// });

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

const shipment = new OpenAPIHono<AppEnv>();

// shipment.openapi(shipOrderRoute, shipOrderHandler);
shipment.openapi(getShippingOrderRoute, getShippingOrderHandler);
// shipment.openapi(cancelShipOrderRoute, cancelShipOrderHandler);
shipment.openapi(createShippingQuoteRoute, createShippingQuoteHandler);

export { shipment };
