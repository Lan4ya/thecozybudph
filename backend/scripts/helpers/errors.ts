export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;
  readonly __isAppError = true; // brand tag

  constructor(opts: {
    status: number;
    message: string;
    code: string;
    details?: unknown;
  }) {
    super(opts.message);
    this.name = "AppError";
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
  }
}

export function isAppError(error: unknown): error is AppError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("__isAppError" in error && error.__isAppError === true) {
    return true;
  }

  if (error instanceof AppError) {
    return true;
  }

  // Fallback: Structural check for raw JSON/serialized exceptions
  return (
    "status" in error &&
    typeof error.status === "number" &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}
