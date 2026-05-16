import express from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import { errorHandler } from "./core/errors/errorHandler";
import { NotFoundError } from "./core/errors/AppError";
import authRoutes from "./modules/auth/auth.routes";
import tripsRoutes from "./modules/trips/trips.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);

// Catch-all 404
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

export default app;
