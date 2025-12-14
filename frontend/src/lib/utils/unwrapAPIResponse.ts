import type { ApiResponse } from "@TheCozyBud/schema";

// This is tailored for what Tanstack Query expects, whereas if there's an err
// you need to throw immediately and let Tanstack handle it.
export function unwrapAPIResponse<T>(res: ApiResponse<T>): T {
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
