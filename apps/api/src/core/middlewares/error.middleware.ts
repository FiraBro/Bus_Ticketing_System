import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { env } from "../../config/env";

interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

function formatZodError(error: ZodError): Record<string, string[]> {
  return error.errors.reduce<Record<string, string[]>>((acc, issue) => {
    const field = issue.path.join(".");
    if (!acc[field]) acc[field] = [];
    acc[field].push(issue.message);
    return acc;
  }, {});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Zod validation errors ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed.",
      errors: formatZodError(err),
    } satisfies ErrorResponse);
    return;
  }

  // ── Known operational errors ───────────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    } satisfies ErrorResponse);
    return;
  }

  // ── Unknown / programmer errors ────────────────────────────────────────────
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message:
      env.NODE_ENV === "production" ? "Something went wrong." : String(err),
    ...(env.NODE_ENV === "development" &&
      err instanceof Error && { stack: err.stack }),
  } satisfies ErrorResponse);
}
