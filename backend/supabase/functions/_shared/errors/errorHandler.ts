import { normalizeError } from "@shared/errors/normalize.ts";
import { ValidationError } from "@shared/errors/Errors.ts";
import { isDev } from "@shared/utils/isDev.ts";
import { ApiErrorResponse } from "@shared/schemas/index.ts";

// NOTE: idk if I should rm stack traces from response even on dev. for error schema consistency. we'll see.
export const errorHandler = (
  error: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  const normalizedError = normalizeError(error);

  if (normalizedError instanceof ValidationError) {
    console.log({
      message: normalizedError.message,
      code: normalizedError.code,
      stack: normalizedError.stack,
      details: {
        fieldErrors: normalizedError.errors,
      },
    });

    const responseBody: ApiErrorResponse = {
      message: normalizedError.message,
      code: normalizedError.code,
      details: {
        fieldErrors: normalizedError.errors,
      },
      ...(Deno.env.get("ENV") === "development" && {
        stack: normalizedError.stack,
      }),
    };

    return Response.json(responseBody, {
      status: 422,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Has to be AppError
  console.log({
    message: normalizedError.message,
    code: normalizedError.code,
    cause: normalizedError.cause,
    stack: normalizedError.stack,
  });

  const responseBody: ApiErrorResponse = {
    message: normalizedError.message,
    code: normalizedError.code,
    ...(isDev && {
      cause: normalizedError.cause,
    }),
    ...(isDev && {
      stack: normalizedError.stack,
    }),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...corsHeaders,
  };

  // Add Retry-After for rate limit errors
  if (normalizedError.code === "RATE_LIMIT_EXCEEDED") {
    headers["Retry-After"] = "60";
  }

  return Response.json(responseBody, {
    status: normalizedError.status,
    headers,
  });
};
