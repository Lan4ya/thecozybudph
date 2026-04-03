import { DrizzleQueryError } from "drizzle-orm";
import { AppError } from "../errors/Errors.ts";

export function handleDbError(message: string, error: unknown) {
  // If the error is already an AppError (e.g., badRequest), preserve it
  if (error instanceof AppError) return error;

  let cause: unknown = "Unknown error";

  if (error instanceof DrizzleQueryError) {
    // For the full error cause log 'error.cause' only:
    // console.log(error.cause);
    cause = error.cause?.message;
  } else {
    cause = error;
  }

  // let the caller throw
  return AppError.internal(message, cause);
}
