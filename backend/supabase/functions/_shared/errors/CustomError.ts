export class CustomError extends Error {
  statusCode: number;
  public errors: { message: string; field?: string }[];

  constructor(
    statusCode: number,
    messageOrErrors: string | { message: string; field?: string }[],
  ) {
    // Handle both single string and multiple errors
    if (typeof messageOrErrors === "string") {
      super(messageOrErrors);
      this.errors = [{ message: messageOrErrors }];
    } else {
      super("Validation failed");
      this.errors = messageOrErrors;
    }

    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  // Static helpers for common error cases

  static badRequest(message: string) {
    return new CustomError(400, message);
  }

  static validation(errors: { message: string; field?: string }[]) {
    return new CustomError(422, errors);
  }

  static forbidden(message: string = "Forbidden") {
    return new CustomError(403, message);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new CustomError(401, message);
  }

  static notFound(message: string = "Resource not found") {
    return new CustomError(404, message);
  }

  static method(message: string = "Method no allowed") {
    return new CustomError(405, message);
  }

  static internal(message: string = "Internal server error") {
    return new CustomError(500, message);
  }
}
