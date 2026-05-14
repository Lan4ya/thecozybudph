import type {
  ApiResponseSuccess,
  SnakeToCamel,
} from "@shared/schemas/index.ts";
import { isDev } from "./isDev.ts";
import { snakeToCamelKeys } from "./string.ts";

export const handleSuccess = <T extends object | null | undefined>(
  payload: T,
  status = 200,
): Response => {
  if (payload === null) {
    return Response.json({ data: null }, { status });
  }

  const body: ApiResponseSuccess<SnakeToCamel<T>> = {
    data: snakeToCamelKeys(payload),
  };

  isDev && console.log("RESPONSE:", body);

  return Response.json(body, { status });
};
