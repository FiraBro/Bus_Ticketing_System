import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { validate } from "../../core/middlewares/auth.middleware.js";
// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const router = Router();

/**
 * @route  POST /api/v1/auth/register
 * @access Public
 * @desc   Create a new passenger account and receive a JWT.
 */
router.post("/register", register);

/**
 * @route  POST /api/v1/auth/login
 * @access Public
 * @desc   Authenticate with email + password and receive a JWT.
 */
router.post("/login", validate(loginSchema), login);

export default router;
