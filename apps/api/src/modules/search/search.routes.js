import { Router } from "express";
import { searchTripsHandler } from "./search.controller.js";
import { searchQuerySchema } from "./search.validation.js";
import { validate } from "../../core/middlewares/auth.middleware.js";

const router = Router();

// Custom conditional validator middleware
// Only executes Zod validation if the user is actually submitting search parameters
const validateSearchQueries = (schema) => (req, res, next) => {
  const { origin, destination, date } = req.query;
  
  if (origin || destination || date) {
    return validate(schema)(req, res, next);
  }
  
  next();
};

// Endpoint: GET /api/trips (Public)
router.get("/", validateSearchQueries(searchQuerySchema), searchTripsHandler);

export default router;
