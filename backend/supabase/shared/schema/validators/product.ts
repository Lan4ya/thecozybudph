import { z } from "zod";

export async function parseAndValidateFormData<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  transform: (fd: FormData) => T,
  opts?: { async?: boolean },
): Promise<z.ZodSafeParseResult<T>> {
  const formData = await req.formData();
  const normalized = transform(formData);
  return opts?.async
    ? schema.safeParseAsync(normalized)
    : schema.safeParse(normalized);
}
