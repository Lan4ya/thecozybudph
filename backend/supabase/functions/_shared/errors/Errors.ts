export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string) {
    return new AppError(400, message);
  }

  static forbidden(message: string = "Forbidden") {
    return new AppError(403, message);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new AppError(401, message);
  }

  static notFound(message: string = "Resource not found") {
    return new AppError(404, message);
  }

  static internal(message: string = "Internal server error") {
    return new AppError(500, message);
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
