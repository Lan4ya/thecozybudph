import { createRoute } from "@hono/zod-openapi";
import { authMiddleware } from "@shared/middlewares/authMiddleware.ts";
import { drizzleMiddleware } from "@shared/middlewares/drizzleMiddleware.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import {
  apiErrorResponseSchema,
  getProfileResponseSchema,
  updateProfileResponseSchema,
  updateProfileSchema,
} from "@shared/schemas/index.ts";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getProfileHandler, updateProfileHandler } from "./profile-handlers.ts";
import { AppEnv } from "@shared/types.d.ts";

export const getProfileRoute = createRoute({
  method: "get",
  path: "/",
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Get authenticated user's profile",
      content: {
        "application/json": {
          schema: getProfileResponseSchema,
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
      description: "Profile not found",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Profile"],
});

export const updateProfileRoute = createRoute({
  method: "patch",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateProfileSchema,
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
      description: "Update authenticated user's profile",
      content: {
        "application/json": {
          schema: updateProfileResponseSchema,
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
      description: "Profile not found",
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
  tags: ["Profile"],
});

const profile = new OpenAPIHono<AppEnv>();

profile.openapi(getProfileRoute, getProfileHandler);
profile.openapi(updateProfileRoute, updateProfileHandler);

export { profile };
