import { AppError } from "../errors/Errors.ts";

// util to properly handle JSON parsing with error handling.
export const parseJSONField = <T = unknown>(
  fieldName: string,
  value: string | null | undefined,
  options?: { optional?: boolean },
): T | undefined => {
  if (value == null || value === "") {
    if (options?.optional) return undefined;
    throw new AppError(400, `${fieldName} is required`);
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw new AppError(400, `${fieldName} must be valid JSON`);
  }
};
