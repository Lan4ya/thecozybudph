import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ValidationError } from "@shared/errors/Errors.ts";
import {
  adminMiddleware,
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
} from "@shared/middlewares/mod.ts";
import {
  apiErrorResponseSchema,
  createEventInquirySchema,
  getEventInquiryResponseSchema,
  queryEventInquiriesResponseSchema,
  queryEventInquiriesSchema,
  updateEventInquirySchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  createEventInquiryHandler,
  getAdminEventInquiryHandler,
  queryAdminEventInquiriesHandler,
  queryUserEventInquiriesHandler,
  updateEventInquiryHandler,
} from "./event-handlers.ts";

export const createEventInquiryRoute = createRoute({
  method: "post",
  path: "/inquiry",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createEventInquirySchema,
        },
      },
    },
  },
  middleware: [
    supabaseMiddleware(),
    // authMiddleware is optional for POST /inquiry to allow guests
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Create new event inquiry",
      content: {
        "application/json": {
          schema: getEventInquiryResponseSchema,
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
  tags: ["Event"],
});

export const queryUserEventInquiriesRoute = createRoute({
  method: "get",
  path: "/inquiry",
  request: {
    query: queryEventInquiriesSchema,
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Query user's event inquiries",
      content: {
        "application/json": {
          schema: queryEventInquiriesResponseSchema,
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
  tags: ["Event"],
});

export const queryAdminEventInquiriesRoute = createRoute({
  method: "get",
  path: "/inquiry/admin",
  request: {
    query: queryEventInquiriesSchema,
  },
  middleware: [
    supabaseMiddleware(),
    authMiddleware(),
    adminMiddleware(),
    drizzleMiddleware(),
  ] as const,
  responses: {
    200: {
      description: "Query all event inquiries (Admin)",
      content: {
        "application/json": {
          schema: queryEventInquiriesResponseSchema,
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
  tags: ["Event (Admin)"],
});

export const updateEventInquiryRoute = createRoute({
  method: "patch",
  path: "/inquiry/{id}",
  request: {
    params: uuidParamSchema("id"),
    body: {
      content: {
        "application/json": {
          schema: updateEventInquirySchema,
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
      description: "Update event inquiry (Admin)",
      content: {
        "application/json": {
          schema: getEventInquiryResponseSchema,
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
    404: {
      description: "Inquiry not found",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Event (Admin)"],
});

export const getAdminEventInquiryRoute = createRoute({
  method: "get",
  path: "/inquiry/admin/{id}",
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
      description: "Get single event inquiry (Admin)",
      content: {
        "application/json": {
          schema: getEventInquiryResponseSchema,
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
    404: {
      description: "Inquiry not found",
      content: {
        "application/json": {
          schema: apiErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Event (Admin)"],
});

const event = new OpenAPIHono<AppEnv>({
  defaultHook: (result) => {
    if (!result.success) {
      throw new ValidationError(result.error);
    }
  },
});

event.openapi(createEventInquiryRoute, createEventInquiryHandler);
event.openapi(queryUserEventInquiriesRoute, queryUserEventInquiriesHandler);
event.openapi(queryAdminEventInquiriesRoute, queryAdminEventInquiriesHandler);
event.openapi(updateEventInquiryRoute, updateEventInquiryHandler);
event.openapi(getAdminEventInquiryRoute, getAdminEventInquiryHandler);

export default event;
