import z from "zod";

export type FieldError = { field?: string; message: string };

export const formatZodError = (error: z.ZodError): FieldError[] => {
  const flattened = z.flattenError(error);

  const errors: FieldError[] = [];

  // Field errors
  for (const [field, msgs] of Object.entries(flattened.fieldErrors)) {
    if (Array.isArray(msgs)) {
      msgs.forEach((message: string) => errors.push({ field, message }));
    }
  }

  // Form-level errors
  if (Array.isArray(flattened.formErrors)) {
    flattened.formErrors.forEach((message: string) => errors.push({ message }));
  }
  return errors;
};
