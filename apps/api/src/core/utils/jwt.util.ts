import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";
import { UserRole } from "../../modules/auth/auth.model";

export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
}

function signToken(payload: object, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export function signAccessToken(payload: TokenPayload): string {
  return signToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
}

export function signRefreshToken(userId: string): string {
  return signToken(
    { sub: userId },
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch {
    throw AppError.unauthorized("Invalid or expired access token.");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token.");
  }
}
