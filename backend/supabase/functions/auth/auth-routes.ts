import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ValidationError } from "@shared/errors/Errors.ts";
import {
  drizzleMiddleware,
  supabaseMiddleware,
} from "@shared/middlewares/mod.ts";
import {
  apiErrorResponseSchema,
  loginResponseSchema,
  loginSchema,
  passwordResetResponseSchema,
  passwordResetSchema,
  resendEmailVerificationResponseSchema,
  resendEmailVerificationSchema,
  signupResponseSchema,
  signupSchema,
} from "@shared/schemas/index.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  loginHanndler,
  passwordResetHandler,
  resendEmailVerificationHandler,
  signupHandler,
} from "./auth-handlers.ts";

export const signupRoute = createRoute({
  method: "post",
  path: "/signup",
  request: {
    body: {
      content: {
        "application/json": {
          schema: signupSchema,
        },
      },
      required: true,
    },
  },
  middleware: [supabaseMiddleware(), drizzleMiddleware()] as const,
  responses: {
    200: {
      description: "Creates a user account",
      content: {
        "application/json": {
          schema: signupResponseSchema,
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
  tags: ["Auth", "Signup"],
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
      required: true,
    },
  },
  middleware: [supabaseMiddleware(), drizzleMiddleware()] as const,
  responses: {
    200: {
      description: "Logs in a user account",
      content: {
        "application/json": {
          schema: loginResponseSchema,
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
  tags: ["Auth", "Login"],
});

export const requestPasswordResetRoute = createRoute({
  method: "post",
  path: "/password-reset",
  request: {
    body: {
      content: {
        "application/json": {
          schema: passwordResetSchema,
        },
      },
      required: true,
    },
  },
  middleware: [supabaseMiddleware(), drizzleMiddleware()] as const,
  responses: {
    200: {
      description: "Request password reset link",
      content: {
        "application/json": {
          schema: passwordResetResponseSchema,
        },
      },
    },
  },
  tags: ["Auth"],
});

export const resendVerificationRoute = createRoute({
  method: "post",
  path: "/resend-verification",
  request: {
    body: {
      content: {
        "application/json": {
          schema: resendEmailVerificationSchema,
        },
      },
      required: true,
    },
  },
  middleware: [supabaseMiddleware(), drizzleMiddleware()] as const,
  responses: {
    200: {
      description: "Resend verification email",
      content: {
        "application/json": {
          schema: resendEmailVerificationResponseSchema,
        },
      },
    },
  },
  tags: ["Auth"],
});

const auth = new OpenAPIHono<AppEnv>({
  defaultHook: (result) => {
    if (!result.success) {
      throw new ValidationError(result.error);
    }
  },
});

auth.openapi(signupRoute, signupHandler);
auth.openapi(loginRoute, loginHanndler);
auth.openapi(requestPasswordResetRoute, passwordResetHandler);
auth.openapi(resendVerificationRoute, resendEmailVerificationHandler);

export { auth };
