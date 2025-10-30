import { CustomError } from "./errors/CustomError.ts";

// util to properly handle JSON parsing with error handling.

export const parseJSONField = <T = unknown>(
  fieldName: string,
  value: string,
): T => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new CustomError(400, `${fieldName} must be valid JSON`);
  }
};
