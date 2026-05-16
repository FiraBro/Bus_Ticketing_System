export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "INTERNAL_ERROR"
  | "TOO_MANY_REQUESTS";

/**
 * AppError represents expected, operational errors (bad input, auth failures, etc.).
 * Any error that is NOT an AppError is treated as an unexpected crash.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational = true;

  constructor(message: string, statusCode: number, code: ErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    // Maintain correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factories ──────────────────────────────────────────────────────────────

  static badRequest(message: string): AppError {
    return new AppError(message, 400, "VALIDATION_ERROR");
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message: string): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, "CONFLICT");
  }
}
