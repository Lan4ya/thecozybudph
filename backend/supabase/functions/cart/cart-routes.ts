import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
} from "@shared/middlewares/mod.ts";
import {
  addCartItemResponseSchema,
  addCartItemSchema,
  deleteCartItemsResponseSchema,
  deleteCartItemsSchema,
  apiErrorResponseSchema,
  getCartItemsResponseSchema,
  updateCartItemResponseSchema,
  updateCartItemSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  addCartItemsHandler,
  deleteCartItemsHandler,
  getCartItemsHandler,
  updateCartItemsVariantHandler,
} from "./cart-handlers.ts";

export const getCartItemsRoute = createRoute({
  method: "get",
  path: "/items",
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get user's cart items",
      content: {
        "application/json": {
          schema: getCartItemsResponseSchema,
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
  tags: ["Cart"],
});

export const addCartItemRoute = createRoute({
  method: "post",
  path: "/items",
  request: {
    body: {
      content: {
        "application/json": {
          schema: addCartItemSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Add item to cart",
      content: {
        "application/json": {
          schema: addCartItemResponseSchema,
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
  tags: ["Cart"],
});

export const updateCartItemRoute = createRoute({
  method: "patch",
  path: "/items/{id}",
  request: {
    params: uuidParamSchema("id"),
    body: {
      content: {
        "application/json": {
          schema: updateCartItemSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Update cart item",
      content: {
        "application/json": {
          schema: updateCartItemResponseSchema,
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
      description: "Cart item not found",
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
  tags: ["Cart"],
});

export const deleteCartItemsRoute = createRoute({
  method: "delete",
  path: "/items",
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteCartItemsSchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Delete cart items",
      content: {
        "application/json": {
          schema: deleteCartItemsResponseSchema,
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
  tags: ["Cart"],
});

const cart = new OpenAPIHono<AppEnv>();

cart.openapi(getCartItemsRoute, getCartItemsHandler);
cart.openapi(addCartItemRoute, addCartItemsHandler);
cart.openapi(updateCartItemRoute, updateCartItemsVariantHandler);
cart.openapi(deleteCartItemsRoute, deleteCartItemsHandler);

export default cart;
