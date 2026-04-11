import type {
  ApiResponseSuccess,
  SnakeToCamel,
} from "@shared/package-types/index.ts";
import { snakeToCamel } from "./caseConverter.ts";

export const handleSuccess = <T extends object | null | undefined>(
  payload: T,
  status = 200,
): Response => {
  const body: ApiResponseSuccess<SnakeToCamel<T>> = {
    data: snakeToCamel(payload ?? null),
  };

  return Response.json(body, { status });
};
