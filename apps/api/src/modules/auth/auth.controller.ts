import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { RegisterBody, LoginBody } from "./auth.dto";
import { env } from "../../config/env";

// ── Cookie Config ──────────────────────────────────────────────────────────

const REFRESH_COOKIE_NAME = "refresh_token";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // JS cannot read this cookie
  secure: env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/api/auth", // Scoped — sent only on auth routes
};

// ── Controller ─────────────────────────────────────────────────────────────

export class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body = req.body as RegisterBody;
      const { user, tokens } = await authService.register(body);

      res.cookie(
        REFRESH_COOKIE_NAME,
        tokens.refreshToken,
        REFRESH_COOKIE_OPTIONS,
      );

      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as LoginBody;
      const { user, tokens } = await authService.login(body);

      res.cookie(
        REFRESH_COOKIE_NAME,
        tokens.refreshToken,
        REFRESH_COOKIE_OPTIONS,
      );

      res.status(200).json({
        success: true,
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const incomingToken: string | undefined =
        req.cookies?.[REFRESH_COOKIE_NAME];
      if (!incomingToken) {
        res
          .status(401)
          .json({
            success: false,
            code: "UNAUTHORIZED",
            message: "No refresh token.",
          });
        return;
      }

      const tokens = await authService.refreshTokens(incomingToken);

      res.cookie(
        REFRESH_COOKIE_NAME,
        tokens.refreshToken,
        REFRESH_COOKIE_OPTIONS,
      );

      res.status(200).json({
        success: true,
        data: { accessToken: tokens.accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      await authService.logout(userId);

      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

      res
        .status(200)
        .json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.sub);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
