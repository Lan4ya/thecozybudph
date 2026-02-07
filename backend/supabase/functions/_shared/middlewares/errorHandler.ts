import { AppError, ValidationError } from "../errors/Errors.ts";
import type { ApiResponseError } from "../types/index.ts";

export const handleError = (
  err: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  console.error(err);

  let body: ApiResponseError;
  let status = 500;

  if (err instanceof ValidationError) {
    body = {
      error: err.errors,
    };
    status = err.statusCode;
  } else if (err instanceof AppError && err.statusCode < 500) {
    body = {
      error: err.message,
    };
    status = err.statusCode;
  } else {
    body = {
      error: "Internal Server Error",
    };
  }

  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
};
