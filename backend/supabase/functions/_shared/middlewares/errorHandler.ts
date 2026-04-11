import { AppError, ValidationError } from "../errors/Errors.ts";
import type { ApiResponseError } from "@shared/package-types/index.ts";

// Global error handler
export const handleError = (
  err: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  let body: ApiResponseError = { error: "Internal Server Error" };
  let status = 500;

  if (err instanceof ValidationError) {
    body = { error: err.errors }; // field errors
    status = err.statusCode;
  } else if (err instanceof AppError) {
    status = err.statusCode;

    // Non 500 statuses, we can safely return the error message
    if (status < 500) {
      body = { error: err.message };
    }

    console.error({
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
  } else {
    // Unknown errors or statuses above 500: Respond with default error message to not leak internals.
    // Log full err instead for debugging.
    console.error(err);
  }

  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
};
