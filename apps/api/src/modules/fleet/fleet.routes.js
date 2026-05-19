import { Router } from "express";
import { createBusHandler, listBusesHandler } from "./fleet.controller.js";
import { createBusSchema } from "./fleet.validation.js";
import { protect, restrictTo, validate } from "../../core/middlewares/auth.middleware.js";

const router = Router();

// Apply authentication and RBAC middlewares globally to all Fleet routes
router.use(protect);
router.use(restrictTo("admin", "operator"));

// Endpoint: POST /api/buses
router.post("/", validate(createBusSchema), createBusHandler);

// Endpoint: GET /api/buses
router.get("/", listBusesHandler);

export default router;
