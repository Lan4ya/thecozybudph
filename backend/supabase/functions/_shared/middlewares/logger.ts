import { MiddlewareHandler, Next, Context } from "hono";

export const devRequestLogger =
  (): MiddlewareHandler => async (c: Context, next: Next) => {
    const req = c.req.raw.clone();

    const contentType = req.headers.get("content-type") ?? "";

    try {
      if (contentType.includes("application/json")) {
        const body = await req.json();
        console.log("[REQ JSON]", body);
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();

        const logged: Record<string, unknown> = {};
        for (const [key, value] of formData.entries()) {
          logged[key] =
            value instanceof File
              ? { name: value.name, size: value.size, type: value.type }
              : value;
        }

        console.log("[REQ FORM]", logged);
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const text = await req.text();
        console.log("[REQ URLENCODED]", text);
      }
    } catch (err) {
      console.warn("[REQ BODY PARSE FAILED]", err);
    }

    await next();
  };
