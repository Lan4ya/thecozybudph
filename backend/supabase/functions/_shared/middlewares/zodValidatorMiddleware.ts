import z, { ZodType } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator as zv } from "@hono/zod-validator";
import { ValidationError } from "../errors/Errors.ts";

export const zodValidatorMiddleware = <
  T extends ZodType,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result, _c) => {
    if (!result.success) {
      const flattened = z.flattenError(result.error);

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
