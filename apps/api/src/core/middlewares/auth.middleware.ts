import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AppError } from "../errors/AppError";
import { UserRole } from "../../modules/auth/auth.model";

/**
 * Protects a route — verifies the Bearer access token and attaches
 * the decoded payload to req.user.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw AppError.unauthorized("No token provided.");
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  req.user = payload;

  next();
}

/**
 * Restricts access to specific roles.
 * Must be used AFTER authenticate().
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw AppError.forbidden(
        "You do not have permission to access this resource.",
      );
    }
    next();
  };
}
