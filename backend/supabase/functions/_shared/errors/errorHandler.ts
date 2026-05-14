// import type { ApiResponseError } from "@shared/schemas/index.ts";
// import { AppError, ValidationError } from "../errors/Errors.ts";
// import { DrizzleQueryError, DrizzleError } from "drizzle-orm/errors";
//
// function isPostgresLikeError(
//   err: unknown,
// ): err is { code?: string; constraint_name?: string } {
//   return typeof err === "object" && err !== null && "code" in err;
// }
//
// // Global Error Handler
// export const handleError = (
//   error: unknown,
//   corsHeaders: Record<string, string> = {},
// ): Response => {
//   let body: ApiResponseError = { error: "Internal Server Error" };
//   let status = 500;
//
//   // Handle Zod Validation Errors
//   if (error instanceof ValidationError) {
//     body = { error: error.errors };
//     status = error.statusCode;
//
//     console.error({
//       type: "ValidationError",
//       errors: error.errors,
//     });
//   }
//
//   // Handle App Errors
//   else if (error instanceof AppError) {
//     body = { error: error.message };
//     status = error.status;
//
//     console.error({
//       type: "AppError",
//       message: error.message,
//       cause: error.cause,
//     });
//   }
//
//   // Handle Drizzle Errors
//   else if (
//     error instanceof DrizzleError ||
//     error instanceof DrizzleQueryError
//   ) {
//     status = 400;
//
//     const pgError = isPostgresLikeError(error.cause) ? error.cause : undefined;
//
//     const code = pgError?.code;
//
//     switch (code) {
//       case "23505": // unique_violation
//         status = 409;
//         body = { error: "Resource already exists." };
//         break;
//
//       case "23503": // foreign_key_violation
//         status = 400;
//         body = { error: "Invalid reference to related resource." };
//         break;
//
//       case "23502": // not_null_violation
//         body = { error: "Missing required field" };
//         break;
//
//       case "23514": // check_violation
//         status = 400;
//         body = { error: "Invalid value provided." };
//         break;
//
//       default:
//         break;
//     }
//
//     console.error({
//       type:
//         error instanceof DrizzleQueryError
//           ? "DrizzleQueryError"
//           : "DrizzleError",
//       message: error.message,
//       cause: error.cause,
//       stack: error.stack,
//     });
//   }
//
//   // Handle Supabase Storage Errors
//   else if (isStorageApiError(error)) {
//     switch (Number(error.statusCode)) {
//       case 403: {
//         const message = "Storage access denied";
//         const cause = error.message;
//
//         body = { error: message };
//         status = 403;
//
//         console.error({
//           type: "SupabaseError",
//           message,
//           cause,
//         });
//
//         break;
//       }
//
//       case 404: {
//         const message = "Storage object not found";
//         const cause = error.message;
//
//         body = { error: message };
//         status = 404;
//
//         console.error({
//           type: "SupabaseError",
//           message,
//           cause,
//         });
//
//         break;
//       }
//
//       case 409: {
//         const message = "Storage object already exists";
//         const cause = error.message;
//
//         body = { error: message };
//         status = 409;
//
//         console.error({
//           type: "SupabaseError",
//           message,
//           cause,
//         });
//
//         break;
//       }
//
//       default: {
//         const message = error.message ?? "Storage operation failed";
//
//         body = { error: message };
//         status = 400;
//
//         console.error({
//           type: "SupabaseError",
//           message,
//           cause: error,
//         });
//
//         break;
//       }
//     }
//   }
//
//   // Fallback
//   else {
//     console.error("Unhandled Error:", error);
//   }
//
//   return Response.json(body, {
//     status,
//     headers: {
//       "Content-Type": "application/json",
//       ...corsHeaders,
//     },
//   });
// };
//
// function isStorageApiError(error: unknown): error is {
//   __isStorageError: true;
//   namespace: "storage";
//   name: "StorageApiError";
//   statusCode?: string;
//   message: string;
// } {
//   return (
//     typeof error === "object" &&
//     error !== null &&
//     "__isStorageError" in error &&
//     error.__isStorageError === true &&
//     "namespace" in error &&
//     error.namespace === "storage" &&
//     "name" in error &&
//     error.name === "StorageApiError"
//   );
// }
import type { ApiResponseError } from "@shared/schemas/index.ts";
import { AppError, ValidationError } from "../errors/Errors.ts";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm/errors";

type PostgresLikeError = {
  code?: string;
  constraint_name?: string;
};

type StorageApiLikeError = {
  __isStorageError: true;
  namespace: "storage";
  name: "StorageApiError";
  statusCode?: string;
  message: string;
};

function isPostgresLikeError(err: unknown): err is PostgresLikeError {
  return typeof err === "object" && err !== null && "code" in err;
}

export function isSupabaseStorageLikeError(
  error: unknown,
): error is StorageApiLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as Record<string, unknown>).__isStorageError === true &&
    (error as Record<string, unknown>).namespace === "storage" &&
    (error as Record<string, unknown>).name === "StorageApiError"
  );
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Internal Server Error";
}

// Global Error Handler
export const handleError = (
  error: unknown,
  corsHeaders: Record<string, string> = {},
): Response => {
  let body: ApiResponseError = { error: "Internal Server Error" };
  let status = 500;

  function setError(params: {
    msg: string;
    code: number;
    type: string;
    err: unknown;
    stack?: string;
  }) {
    body = { error: params.msg };
    status = params.code;

    console.error({
      type: params.type,
      message: params.msg,
      cause: params.err,
      stack: params.stack,
    });
  }

  if (error instanceof ValidationError) {
    setError({
      type: "ValidationError",
      msg: "Validation failed",
      code: error.statusCode,
      err: error.errors,
      stack: error.stack,
    });

    body = { error: error.errors };
  } else if (error instanceof AppError) {
    setError({
      type: "AppError",
      msg: error.message,
      code: error.status,
      err: error.cause,
      stack: error.stack,
    });

    body = { error: error.message };
  } else if (
    error instanceof DrizzleError ||
    error instanceof DrizzleQueryError
  ) {
    const pgError = isPostgresLikeError(error.cause) ? error.cause : undefined;

    switch (pgError?.code) {
      case "23505":
        setError({
          type: "DrizzleError",
          msg: "Resource already exists.",
          code: 409,
          err: error.cause,
          stack: error.stack,
        });
        body = { error: "Resource already exists." };
        break;

      case "23503":
        setError({
          type: "DrizzleError",
          msg: "Invalid reference to related resource.",
          code: 400,
          err: error.cause,
          stack: error.stack,
        });
        body = { error: "Invalid reference to related resource." };
        break;

      case "23502":
        setError({
          type: "DrizzleError",
          msg: "Missing required field.",
          code: 400,
          err: error.cause,
          stack: error.stack,
        });
        body = { error: "Missing required field." };
        break;

      case "23514":
        setError({
          type: "DrizzleError",
          msg: "Invalid value provided.",
          code: 400,
          err: error.cause,
          stack: error.stack,
        });
        body = { error: "Invalid value provided." };
        break;

      default:
        setError({
          type: "DrizzleError",
          msg: "Database operation failed.",
          code: 500,
          err: error.cause,
          stack: error.stack,
        });
        body = { error: "Database operation failed." };
        break;
    }
  } else if (isSupabaseStorageLikeError(error)) {
    switch (Number(error.statusCode)) {
      case 403:
        setError({
          type: "StorageError",
          msg: "Storage access denied",
          code: 403,
          err: error.message,
        });
        body = { error: "Storage access denied" };
        break;

      case 404:
        setError({
          type: "StorageError",
          msg: "Storage object not found",
          code: 404,
          err: error.message,
        });
        body = { error: "Storage object not found" };
        break;

      case 409:
        setError({
          type: "StorageError",
          msg: "Storage object already exists",
          code: 409,
          err: error.message,
        });
        body = { error: "Storage object already exists" };
        break;

      default:
        setError({
          type: "StorageError",
          msg: toErrorMessage(error),
          code: 502,
          err: error,
        });
        body = { error: "Storage operation failed" };
        break;
    }
  } else {
    console.error({
      type: "UnhandledError",
      message: toErrorMessage(error),
      cause: error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  return Response.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
};
