import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { AppError, ValidationError } from "@shared/errors/Errors.ts";
import { isAuthApiError as isSupabaseAuthApiError } from "supabase";

type PostgresError = {
  code?: string;
  constraint_name?: string;
};

type StorageApiError = {
  __isStorageError: true;
  name: "StorageApiError";
  statusCode?: string;
  message: string;
};

function isPostgresError(err: unknown): err is PostgresError {
  return typeof err === "object" && err !== null && "code" in err;
}

export function isSupabaseStorageError(
  error: unknown,
): error is StorageApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as Record<string, unknown>).__isStorageError === true &&
    (error as Record<string, unknown>).name === "StorageApiError"
  );
}

export function normalizeError(error: unknown): AppError | ValidationError {
  if (error instanceof ValidationError) return error;
  if (error instanceof AppError) return error;

  //  Drizzle errors (Postgres)
  if (error instanceof DrizzleError || error instanceof DrizzleQueryError) {
    const pgError = isPostgresError(error.cause) ? error.cause : undefined;

    // Unique violation (duplicate key)
    if (pgError?.code === "23505") {
      return AppError.conflict({
        message: pgError.constraint_name
          ? `Duplicate entry: ${pgError.constraint_name}`
          : "Duplicate entry",
        cause: error,
      });
    }

    // Foreign key violation
    if (pgError?.code === "23503") {
      return AppError.badRequest({
        message: pgError.constraint_name
          ? `Referenced record does not exist: ${pgError.constraint_name}`
          : "Invalid reference",
        cause: error,
      });
    }

    // Not null violation
    if (pgError?.code === "23502") {
      return AppError.badRequest({
        message: pgError.constraint_name
          ? `Missing required field: ${pgError.constraint_name}`
          : "Missing required field",
        cause: error,
      });
    }

    // Any other Postgres error -> 400
    if (pgError?.code) {
      return AppError.badRequest({
        message: `Database error: ${pgError.code}`,
        cause: error,
      });
    }

    // Fallback for Drizzle errors
    return AppError.internal({
      message: "Database query failed",
      cause: error,
    });
  }

  //  Supabase Storage errors
  if (isSupabaseStorageError(error)) {
    const status = Number(error.statusCode);
    switch (status) {
      case 403:
        return AppError.forbidden({
          message: error.message || "Access denied to storage",
          cause: error,
        });
      case 404:
        return AppError.notFound({
          message: error.message || "Storage object not found",
          cause: error,
        });
      case 409:
        return AppError.conflict({
          message: error.message || "Storage conflict",
          cause: error,
        });
      default:
        return AppError.internal({
          message: error.message || "Storage error",
          cause: error,
        });
    }
  }

  // Supabase Auth API Errors
  // https://supabase.com/docs/guides/auth/debugging/error-codes
  if (isSupabaseAuthApiError(error)) {
    switch (error.status) {
      case 400:
        return AppError.badRequest({
          message: error.message,
          cause: error.cause,
        });

      case 403:
        return AppError.unauthorized({
          message: error.message,
          cause: error.cause,
        });

      case 422:
        return AppError.unprocessable({
          message: error.message,
          cause: error.cause,
        });

      case 429:
        return AppError.rateLimit({
          message: error.message,
          cause: error.cause,
        });

      default:
        return AppError.internal({
          message: error.message,
          cause: error,
        });
    }
  }

  // JS error
  if (error instanceof Error) {
    return AppError.internal({
      message: error.message,
      cause: error,
    });
  }

  return AppError.internal({
    cause: undefined,
  });
}
