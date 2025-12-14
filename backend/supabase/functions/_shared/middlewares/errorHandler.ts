import { CustomError } from "../errors/CustomError.ts";
import type { ApiResponseError } from "../schema/index.ts";

export const handleError = (
  err: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  const body: ApiResponseError =
    err instanceof CustomError
      ? { success: false, error: err.errors }
      : {
          success: false,
          error: `${err}`,
        };

  console.error(err);

  return Response.json(body, {
    status: err instanceof CustomError ? err.statusCode : 500,
    headers: corsHeaders,
  });
};
