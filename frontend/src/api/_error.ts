export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

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
