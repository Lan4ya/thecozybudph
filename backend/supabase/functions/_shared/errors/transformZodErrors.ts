import z from "zod";

export function transformZodError(zodErr: z.ZodError) {
  const flattened = z.flattenError(zodErr);

  const errors: { field?: string; message: string }[] = [];

  // field errors
  for (const [field, msgs] of Object.entries(flattened.fieldErrors)) {
    if (Array.isArray(msgs)) {
      msgs.forEach((message: string) => errors.push({ field, message }));
    }
  }

  // form-level errors
  if (Array.isArray(flattened.formErrors)) {
    flattened.formErrors.forEach((message: string) => errors.push({ message }));
  }

  return errors;
}
