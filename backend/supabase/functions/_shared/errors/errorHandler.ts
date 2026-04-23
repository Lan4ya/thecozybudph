import type { ApiResponseError } from "@shared/package-types/index.ts";
import { AppError, ValidationError } from "../errors/Errors.ts";
import { DrizzleQueryError, DrizzleError } from "drizzle-orm/errors";

function isPostgresLikeError(
  err: unknown,
): err is { code?: string; constraint_name?: string } {
  return typeof err === "object" && err !== null && "code" in err;
}

// Global Error Handler
export const handleError = (
  error: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  let body: ApiResponseError = { error: "Internal Server Error" };
  let status = 500;

  // Handle Drizzle Errors
  if (error instanceof DrizzleError || error instanceof DrizzleQueryError) {
    status = 400;

    const pgError = isPostgresLikeError(error.cause) ? error.cause : undefined;

    const code = pgError?.code;

    switch (code) {
      case "23505": // unique_violation
        status = 409;
        body = { error: "Resource already exists." };
        break;

      case "23503": // foreign_key_violation
        status = 400;
        body = { error: "Invalid reference to related resource." };
        break;

      case "23502": // not_null_violation
        body = { error: "Missing required field" };
        break;

      case "23514": // check_violation
        status = 400;
        body = { error: "Invalid value provided." };
        break;

      default:
        break;
    }

    console.error({
      type:
        error instanceof DrizzleQueryError
          ? "DrizzleQueryError"
          : "DrizzleError",
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
  }

  // Handle Zod Validation Errors
  else if (error instanceof ValidationError) {
    body = { error: error.errors };
    status = error.statusCode;

    console.error({
      type: "ValidationError",
      message: error.message,
      cause: error.cause,
    });
  }

  // Handle App Errors
  else if (error instanceof AppError) {
    body = { error: error.message };
    status = error.statusCode;

    console.error({
      type: "AppError",
      message: error.message,
      cause: error.cause,
    });
  }

  // Fallback
  else {
    console.error("Unhandled Error:", error);
  }

  return Response.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
};
