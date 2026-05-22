import z from "zod";
import { FieldError, formatZodError } from "@shared/errors/formatZodError.ts";

type ErrorCode =
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_SERVER_ERROR"
  | "UNKNOWN_ERROR";

export class ValidationError extends Error {
  readonly errors: FieldError[];
  readonly status: number;
  readonly code: ErrorCode;

  constructor(error: z.ZodError) {
    super("Validation failed");
    this.errors = formatZodError(error);
    this.status = 422;
    this.code = "VALIDATION_ERROR";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor({
    status,
    message,
    cause,
  }: {
    status: number;
    message: string;
    cause?: unknown;
  }) {
    super(message, { cause });

    this.status = status;
    this.code = this.getDefaultCode(status);

    Error.captureStackTrace(this, this.constructor);
  }

  private getDefaultCode(status: number): ErrorCode {
    const codes: Record<number, ErrorCode> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      429: "RATE_LIMIT_EXCEEDED",
      500: "INTERNAL_SERVER_ERROR",
    };

    return (
      codes[status] ||
      (status >= 500 ? "INTERNAL_SERVER_ERROR" : "UNKNOWN_ERROR")
    );
  }

  private static create(
    status: number,
    defaultMessage: string,
    options?: { message?: string; cause?: unknown },
  ) {
    const { message = defaultMessage, cause } = options || {};
    return new AppError({ status, message, cause });
  }

  static badRequest(options?: { message?: string; cause?: unknown }) {
    return this.create(400, "Bad Request", options);
  }

  static forbidden(options?: { message?: string; cause?: unknown }) {
    return this.create(403, "Forbidden", options);
  }

  static unauthorized(options?: { message?: string; cause?: unknown }) {
    return this.create(401, "Unauthorized", options);
  }

  static notFound(options?: { message?: string; cause?: unknown }) {
    return this.create(404, "Not Found", options);
  }

  static conflict(options?: { message?: string; cause?: unknown }) {
    return this.create(409, "Conflict", options);
  }

  static internal(options?: { message?: string; cause?: unknown }) {
    return this.create(500, "Internal Server Error", options);
  }
}
