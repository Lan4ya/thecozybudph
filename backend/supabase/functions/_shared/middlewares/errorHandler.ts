import { AppError, ValidationError } from "../errors/Errors.ts";
import type { ApiResponseError } from "../types/index.ts";

export const handleError = (
  err: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  let body: ApiResponseError;
  let status = 500;

  if (err instanceof ValidationError) {
    body = {
      error: err.errors, // field errors
    };
    status = err.statusCode;
  } else if (err instanceof AppError && err.statusCode < 500) {
    body = {
      error: err.message,
    };
    status = err.statusCode;
  } else {
    // statuses above 500: Respond with a generic error to not leak internals.
    // Log errs instead.
    body = {
      error: "Internal Server Error",
    };

    if (err instanceof AppError) {
      console.error(err.message);
      console.error(err.cause);
    } else {
      console.error(err);
    }
  }

  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
};
