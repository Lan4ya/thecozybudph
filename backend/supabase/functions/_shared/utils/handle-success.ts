import { Context, TypedResponse } from "hono";
import { isDev } from "@shared/utils/isDev.ts";
import { ContentfulStatusCode } from "hono/utils/http-status"; // Changed from StatusCode

export const handleSuccess = <T, S extends ContentfulStatusCode = 200>(
  c: Context,
  data: T,
  status: S = 200 as S,
): TypedResponse<{ data: T }, S, "json"> => {
  isDev && console.log("[SUCCESS RESPONSE]:", data);
  return c.json({ data }, status) as unknown as TypedResponse<
    { data: T },
    S,
    "json"
  >;
};
