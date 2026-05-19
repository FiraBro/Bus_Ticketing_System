import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import fleetRoutes from "./modules/fleet/fleet.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import searchRoutes from "./modules/search/search.routes.js";

import globalErrorHandler from "./core/middlewares/error.middleware.js";
const app = express();

// =============================================================================
// Body Parser
// =============================================================================

app.use(express.json());
app.use(cors());
// =============================================================================
// Health Check
// =============================================================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API running successfully",
  });
});

// =============================================================================
// Routes
// =============================================================================

// Versioned APIs
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/buses", fleetRoutes);
app.use("/api/v1/trips", searchRoutes);
app.use("/api/v1", inventoryRoutes);

// Standard / Unversioned APIs
app.use("/api/buses", fleetRoutes);
app.use("/api/trips", searchRoutes);
app.use("/api", inventoryRoutes);

// =============================================================================
// Global Error Handler
// =============================================================================

app.use(globalErrorHandler);

export default app;
