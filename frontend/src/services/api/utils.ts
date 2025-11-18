import type { ApiResponse } from "@TheCozyBud/schema";

export function unwrapResponse<T>(res: ApiResponse<T>): T {
  if (!res.success) {
    const normalizedError =
      typeof res.error === "string"
        ? new Error(res.error)
        : new Error(res.error.map((e) => e.message).join(", "));
    console.log("api response data error: ", res.error);
    throw normalizedError;
  }
  console.log("api response data: ", res.data);
  return res.data;
}
