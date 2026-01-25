import { snakeToCamel } from "../utils/caseConverter.ts";
import type { ApiResponseSuccess, SnakeToCamel } from "../core/index.ts";

export const handleSuccess = <T extends object>(
  payload: T,
  status = 200,
): Response => {
  const body: ApiResponseSuccess<SnakeToCamel<T>> = {
    success: true,
    data: snakeToCamel(payload),
  };

  return Response.json(body, { status });
};
