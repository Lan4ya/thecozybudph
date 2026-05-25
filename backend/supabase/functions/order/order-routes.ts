import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
  supabaseServiceMiddleware,
} from "@shared/middlewares/mod.ts";
import {
  apiErrorResponseSchema,
  createOrderResponseSchema,
  createOrderSchema,
  getOrderPaymentStatusResponseSchema,
  getOrderItemResponseSchema,
  payOrderResponseSchema,
  payOrderSchema,
  queryOrdersResponseSchema,
  queryOrdersSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  createOrderHandler,
  getOrderItemHandler,
  getOrderPaymentStatusHandler,
  orderPaymentWebhookHandler,
  payOrderHandler,
  queryOrderHandler,
} from "./order-handlers.ts";

export const orderPaymentWebhookRoute = createRoute({
  method: "post",
  path: "/webhook",
  responses: {
    200: {
      description: "Handle payment webhook",
      content: {
        "application/json": {
          schema: getOrderItemResponseSchema.omit({ data: true }).extend({
            success: z.boolean(),
          }),
        },
      },
    },
  },
  tags: ["Order"],
});

export const queryOrdersRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: queryOrdersSchema,
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Query user orders",
      content: {
        "application/json": {
          schema: queryOrdersResponseSchema,
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
  tags: ["Order"],
});

export const getOrderItemRoute = createRoute({
  method: "get",
  path: "/item/{id}",
  request: {
    params: uuidParamSchema("id"),
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get order details",
      content: {
        "application/json": {
          schema: getOrderItemResponseSchema,
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
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Order"],
});

export const createOrderRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createOrderSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Create new order",
      content: {
        "application/json": {
          schema: createOrderResponseSchema,
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
    422: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Order"],
});

export const payOrderRoute = createRoute({
  method: "post",
  path: "/{id}/pay",
  request: {
    params: uuidParamSchema("id"),
    body: {
      content: {
        "application/json": {
          schema: payOrderSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Pay order",
      content: {
        "application/json": {
          schema: payOrderResponseSchema,
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
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
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
  tags: ["Order"],
});

export const getOrderPaymentStatusRoute = createRoute({
  method: "get",
  path: "/payment/{id}/status",
  request: {
    params: uuidParamSchema("id"),
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    supabaseServiceMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get order payment status",
      content: {
        "application/json": {
          schema: getOrderPaymentStatusResponseSchema,
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
    404: {
      description: "Payment not found",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Order"],
});

const order = new OpenAPIHono<AppEnv>();

order.openapi(queryOrdersRoute, queryOrderHandler);
order.openapi(getOrderItemRoute, getOrderItemHandler);
order.openapi(createOrderRoute, createOrderHandler);
order.openapi(payOrderRoute, payOrderHandler);
order.openapi(getOrderPaymentStatusRoute, getOrderPaymentStatusHandler);

// Special case for webhook as it's not following the standard AppEnv strictly or might need direct access
order.post("/webhook", orderPaymentWebhookHandler);

export default order;
