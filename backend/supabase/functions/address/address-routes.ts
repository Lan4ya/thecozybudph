import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
} from "@shared/middlewares/mod.ts";
import {
  createAddressResponseSchema,
  createAddressSchema,
  apiErrorResponseSchema,
  getAddressesResponseSchema,
  getAddressResponseSchema,
  updateAddressResponseSchema,
  updateAddressSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  createAddressHandler,
  getAddressesHandler,
  getDefaultAddressesHandler,
  updateAddressHandler,
} from "./address-handlers.ts";

export const getAddressesRoute = createRoute({
  method: "get",
  path: "/",
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get user's addresses",
      content: {
        "application/json": {
          schema: getAddressesResponseSchema,
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
  tags: ["Address"],
});

export const getDefaultAddressRoute = createRoute({
  method: "get",
  path: "/default",
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get user's default address",
      content: {
        "application/json": {
          schema: getAddressResponseSchema,
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
  tags: ["Address"],
});

export const createAddressRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createAddressSchema,
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
      description: "Create new address",
      content: {
        "application/json": {
          schema: createAddressResponseSchema,
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
  tags: ["Address"],
});

export const updateAddressRoute = createRoute({
  method: "patch",
  path: "/{id}",
  request: {
    params: uuidParamSchema("id"),
    body: {
      content: {
        "application/json": {
          schema: updateAddressSchema,
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
      description: "Update existing address",
      content: {
        "application/json": {
          schema: updateAddressResponseSchema,
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
      description: "Address not found",
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
  tags: ["Address"],
});

const address = new OpenAPIHono<AppEnv>();

address.openapi(getAddressesRoute, getAddressesHandler);
address.openapi(getDefaultAddressRoute, getDefaultAddressesHandler);
address.openapi(createAddressRoute, createAddressHandler);
address.openapi(updateAddressRoute, updateAddressHandler);

export default address;
