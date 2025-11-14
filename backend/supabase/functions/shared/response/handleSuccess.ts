import { snakeToCamel } from "../caseConverter.ts";
import type { ApiResponseSuccess, SnakeToCamel } from "../schema";

export const handleSuccess = <T extends object>(
  payload: T,
  corsHeaders: Record<string, string> = {},
): Response => {
  const body: ApiResponseSuccess<SnakeToCamel<T>> = {
    success: true,
    data: snakeToCamel(payload),
  };

  return Response.json(body, { headers: corsHeaders });
};
