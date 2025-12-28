import { AppError, ValidationError } from "../errors/Errors.ts";
import type { ApiResponseError } from "../schema/index.ts";

export const handleError = (
  err: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  const body: ApiResponseError =
    err instanceof AppError
      ? { success: false, error: err.message }
      : err instanceof ValidationError
        ? { success: false, error: err.errors }
        : {
            success: false,
            error: `${err}`,
          };

  console.error(err);

  return Response.json(body, {
    status:
      err instanceof AppError || err instanceof ValidationError
        ? err.statusCode
        : 500,
    headers: corsHeaders,
  });
};
