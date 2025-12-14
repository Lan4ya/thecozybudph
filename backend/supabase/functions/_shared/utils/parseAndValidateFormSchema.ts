import { z } from "zod";
import { Context } from "hono";

export async function parseAndValidateFormData<T>(
  c: Context,
  schema: z.ZodSchema<T>,
  transform: (fd: FormData) => T,
  opts?: { async?: boolean },
): Promise<z.ZodSafeParseResult<T>> {
  const formData = await c.req.formData();
  const normalized = transform(formData);
  return opts?.async
    ? schema.safeParseAsync(normalized)
    : schema.safeParse(normalized);
}
