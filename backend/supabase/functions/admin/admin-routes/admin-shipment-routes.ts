import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { adminMiddleware } from "@shared/middlewares/adminMiddleware.ts";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import {
  apiErrorResponseSchema,
  createShippingQuoteResponseSchema,
  createShippingQuoteSchema,
  getShippingDriverResponseSchema,
  getShippingDriverSchema,
  getShippingOrderResponseSchema,
  shipOrderResponseSchema,
  shipOrderSchema,
  successSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import { z } from "zod";
import {
  cancelShipOrderHandler,
  createShipmentOrderHandler,
  createShippingQuoteHandler as createShipmentQuoteHandler,
  getShipmentOrderHandler,
  getShippingDriverHandler,
  handleShipmentWebhook,
} from "../admin-handlers.ts";

export const handleWebhookRoute = createRoute({
  method: "post",
  path: "/shipment/webhook",
  middleware: [drizzleMiddleware()] as const,
  responses: {
    200: {
      description: "Handle shipment webhook",
      content: {
        "application/json": {
          schema: successSchema,
        },
      },
    },
  },
  tags: ["Shipment", "Webhook"],
});

export const createShipmentQuoteRoute = createRoute({
  method: "post",
  path: "/shipment/quotes",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createShippingQuoteSchema,
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

export const createShipmentOrderRoute = createRoute({
  method: "patch",
  path: "order/{id}/ship",
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

export const getShipmentOrderRoute = createRoute({
  method: "get",
  path: "/order/{id}/ship",
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
      description: "Get shipment (lalamove) order details",
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

export const cancelShipmentOrderRoute = createRoute({
  method: "delete",
  path: "/order/{id}/ship",
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
      description: "Cancel shipment (lalmove) order",
      content: {
        "application/json": {
          schema: successSchema,
        },
      },
    },
    400: {
      description: "Bad request",
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
  tags: ["Admin"],
});

// export const editShipmentOrderRoute = createRoute({
//   method: "patch",
//   path: "/order/{id}/ship/edit",
//   request: {
//     params: uuidParamSchema("id"),
//     body: {
//       content: {
//         "application/json": {
//           schema: editShippingOrderSchema,
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
//       description: "Edit shipping order",
//       content: {
//         "application/json": {
//           schema: editShippingOrderResponseSchema,
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
//   },
//   tags: ["Admin"],
// });

// export const addShippingOrderPriorityFeeRoute = createRoute({
//   method: "post",
//   path: "/shipment/priority-fee",
//   request: {
//     body: {
//       content: {
//         "application/json": {
//           schema: addShippingOrderPriorityFeeSchema,
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
//       description: "Add priority fee",
//       content: {
//         "application/json": {
//           schema: addShippingOrderPriorityFeeResponseSchema,
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
//   },
//   tags: ["Admin"],
// });

export const getShippingDriverRoute = createRoute({
  method: "get",
  path: "/shipment/driver",
  request: {
    query: getShippingDriverSchema,
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    drizzleMiddleware(),
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

// export const changeShippingDriverRoute = createRoute({
//   method: "post",
//   path: "/shipment/driver/change",
//   request: {
//     body: {
//       content: {
//         "application/json": {
//           schema: changeShippingDriverSchema,
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
//       description: "Change shipping driver",
//       content: {
//         "application/json": {
//           schema: changeShippingDriverResponseSchema,
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
//   },
//   tags: ["Admin"],
// });

// export const getShippingCityRoute = createRoute({
//   method: "get",
//   path: "/shipment/city/{cityId}",
//   request: {
//     params: getShippingCitySchema,
//   },
//   responses: {
//     200: {
//       description: "Get shipping city",
//       content: {
//         "application/json": {
//           schema: getShippingCityResponseSchema,
//         },
//       },
//     },
//   },
//   tags: ["Shipment"],
// });

// export const getShippingMarketRoute = createRoute({
//   method: "get",
//   path: "/shipment/market",
//   responses: {
//     200: {
//       description: "Get shipping market",
//       content: {
//         "application/json": {
//           schema: getShippingMarketResponseSchema,
//         },
//       },
//     },
//   },
//   tags: ["Shipment"],
// });

export const registerShipmentRoutes = (admin: OpenAPIHono<AppEnv>) => {
  admin.openapi(createShipmentOrderRoute, createShipmentOrderHandler);
  admin.openapi(getShipmentOrderRoute, getShipmentOrderHandler);
  admin.openapi(cancelShipmentOrderRoute, cancelShipOrderHandler);
  admin.openapi(createShipmentQuoteRoute, createShipmentQuoteHandler);
  // admin.openapi(
  //   addShippingOrderPriorityFeeRoute,
  //   addShippingOrderPriorityFeeHandler,
  // );
  admin.openapi(getShippingDriverRoute, getShippingDriverHandler);
  admin.openapi(handleWebhookRoute, handleShipmentWebhook);
  // admin.openapi(changeShippingDriverRoute, changeShippingDriverHandler);
  // admin.openapi(getShippingCityRoute, getShippingCityHandler);
  // admin.openapi(getShippingMarketRoute, getShippingMarketHandler);
  // admin.openapi(editShipmentOrderRoute, editShippingOrderHandler);
};
