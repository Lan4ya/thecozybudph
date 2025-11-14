import type { ApiResponse } from "@TheCozyBud/schema";

export function unwrapResponse<T>(res: ApiResponse<T>): T {
  if (!res.success) throw res.error;
  console.log("api response data:", res.data);
  return res.data;
}
