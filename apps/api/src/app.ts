import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { globalErrorHandler } from "core/middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

// ── Security Headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Limit body size — prevents large payload attacks
app.use(cookieParser());

// ── Global Rate Limiting ───────────────────────────────────────────────────
// Auth routes get a stricter limit (defined below).
// Adjust these numbers based on real traffic data — don't guess.
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    },
  }),
);

// ── Auth-specific stricter rate limiter ────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "TOO_MANY_REQUESTS",
    message: "Too many auth attempts. Please try again in 15 minutes.",
  },
});

// ── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res
    .status(404)
    .json({ success: false, code: "NOT_FOUND", message: "Route not found." });
});

// ── Global Error Handler ───────────────────────────────────────────────────
// Must be registered LAST — Express identifies error handlers by 4 arguments
app.use(globalErrorHandler);

export default app;
