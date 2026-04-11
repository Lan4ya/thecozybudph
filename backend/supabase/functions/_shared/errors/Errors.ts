export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string, cause?: unknown) {
    super(message, { cause });
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, cause?: unknown) {
    return new AppError(400, message, cause);
  }

  static forbidden(message: string = "Forbidden", cause?: unknown) {
    return new AppError(403, message, cause);
  }

  static unauthorized(message: string = "Unauthorized", cause?: unknown) {
    return new AppError(401, message, cause);
  }

  static notFound(message: string = "Resource not found") {
    return new AppError(404, message);
  }

  static conflict(message: string = "Conflict") {
    return new AppError(409, message);
  }

  static internal(message: string = "Internal server error", cause?: unknown) {
    return new AppError(500, message, cause);
  }
}

export type ValidationFieldError = { field?: string; message: string };

export class ValidationError extends Error {
  statusCode = 422;
  errors: ValidationFieldError[];

  constructor(errors: ValidationFieldError[]) {
    super("Validation failed");
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
