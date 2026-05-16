import bcrypt from "bcryptjs";
import { env } from "../../config/env";
import { AppError } from "core/errors/AppError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.util";
import { User, UserDocument } from "./auth.model";
import { LoginBody, RegisterBody } from "./auth.dto";

// ── Return Shapes ──────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: Pick<UserDocument, "_id" | "name" | "email" | "role">;
  tokens: AuthTokens;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildTokens(user: UserDocument): AuthTokens {
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken(user._id.toString());
  return { accessToken, refreshToken };
}

async function hashValue(value: string): Promise<string> {
  return bcrypt.hash(value, env.BCRYPT_SALT_ROUNDS);
}

// ── Service ────────────────────────────────────────────────────────────────

export class AuthService {
  /**
   * Register a new passenger account.
   * Operators and admins are created through separate admin flows.
   */
  async register(body: RegisterBody): Promise<AuthResult> {
    const existing = await User.findOne({ email: body.email }).lean();
    if (existing) {
      throw AppError.conflict("An account with this email already exists.");
    }

    const passwordHash = await hashValue(body.password);

    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: "passenger",
    });

    const tokens = buildTokens(user);

    // Persist a hashed copy of the refresh token — rotating on each login
    user.refreshTokenHash = await hashValue(tokens.refreshToken);
    await user.save();

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Validate credentials and return fresh tokens.
   */
  async login(body: LoginBody): Promise<AuthResult> {
    // Explicitly select passwordHash — it's excluded by default via `select: false`
    const user = await User.findOne({ email: body.email }).select(
      "+passwordHash +refreshTokenHash",
    );

    if (!user || !user.isActive) {
      // Vague message intentionally — do not reveal which field failed
      throw AppError.unauthorized("Invalid email or password.");
    }

    const isPasswordValid = await user.comparePassword(body.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid email or password.");
    }

    const tokens = buildTokens(user);

    user.refreshTokenHash = await hashValue(tokens.refreshToken);
    await user.save();

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Issue a new access token using a valid refresh token.
   * Implements refresh token rotation — old token is invalidated on use.
   */
  async refreshTokens(incomingRefreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(incomingRefreshToken);

    const user = await User.findById(payload.sub).select("+refreshTokenHash");
    if (!user || !user.isActive) {
      throw AppError.unauthorized("User not found or deactivated.");
    }

    const isTokenValid = await user.compareRefreshToken(incomingRefreshToken);
    if (!isTokenValid) {
      // Possible token reuse — invalidate all sessions defensively
      user.refreshTokenHash = null;
      await user.save();
      throw AppError.unauthorized(
        "Refresh token is invalid or has already been used.",
      );
    }

    const tokens = buildTokens(user);

    user.refreshTokenHash = await hashValue(tokens.refreshToken);
    await user.save();

    return tokens;
  }

  /**
   * Revoke the refresh token — effectively logging the user out.
   */
  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  /**
   * Fetch the current authenticated user's public profile.
   */
  async getMe(userId: string): Promise<UserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found.");
    }
    return user;
  }
}

// Export a singleton — no need for DI containers at this scale
export const authService = new AuthService();
