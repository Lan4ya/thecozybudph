import z, { ZodType } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ValidationError } from "../errors/Errors.ts";
import { AppEnv } from "@shared/types.d.ts";

export const zodValidatorMiddleware = <
  T extends ZodType,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      const flattened = z.flattenError(result.error);

      // Transform Errors
      const errors: { field?: string; message: string }[] = [];

      // Field errors
      for (const [field, msgs] of Object.entries(flattened.fieldErrors)) {
        if (Array.isArray(msgs)) {
          msgs.forEach((message: string) => errors.push({ field, message }));
        }
      }

      // Form-level errors
      if (Array.isArray(flattened.formErrors)) {
        flattened.formErrors.forEach((message: string) =>
          errors.push({ message }),
        );
      }

      throw new ValidationError(errors);
    }
  });

type ErrorShape = {
  field?: string;
  message: string;
};

export const formatZodError = (error: z.ZodError): ErrorShape[] => {
  const flattened = z.flattenError(error);

  // Transform Errors
  const errors: { field?: string; message: string }[] = [];

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
