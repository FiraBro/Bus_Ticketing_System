import { Router } from "express";
import {
  createRouteHandler,
  listRoutesHandler,
  createTripHandler,
  getTripByIdHandler,
  listTripsHandler,
} from "./inventory.controller.js";
import { createRouteSchema, createTripSchema } from "./inventory.validation.js";
import { protect, restrictTo, validate } from "../../core/middlewares/auth.middleware.js";

const router = Router();

// =============================================================================
// Public / Authenticated Internal Endpoints
// =============================================================================

// Endpoint: GET /api/trips/:id (Public/Internal)
router.get("/trips/:id", getTripByIdHandler);

// Endpoint: GET /api/trips (Public/Internal)
router.get("/trips", listTripsHandler);

// Endpoint: GET /api/routes (Public/Internal)
router.get("/routes", listRoutesHandler);

// =============================================================================
// Protected Operator / Admin Endpoints
// =============================================================================

// Endpoint: POST /api/routes (Admin/Operator only)
router.post(
  "/routes",
  protect,
  restrictTo("admin", "operator"),
  validate(createRouteSchema),
  createRouteHandler
);

// Endpoint: POST /api/trips (Admin/Operator only)
router.post(
  "/trips",
  protect,
  restrictTo("admin", "operator"),
  validate(createTripSchema),
  createTripHandler
);

export default router;
