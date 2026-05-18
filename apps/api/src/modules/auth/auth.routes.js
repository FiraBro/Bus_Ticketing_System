import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { validate } from "../../core/middlewares/auth.middleware.js";
// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

export default router;
