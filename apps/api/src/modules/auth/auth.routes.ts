import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../core/middlewares/validation.middleware";
import { authenticate } from "../../core/middlewares/auth.middleware";

import { RegisterDto, LoginDto } from "./auth.dto";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(RegisterDto),
  authController.register.bind(authController),
);
router.post(
  "/login",
  validate(LoginDto),
  authController.login.bind(authController),
);
router.post("/refresh", authController.refresh.bind(authController));

// Protected routes
router.post(
  "/logout",
  authenticate,
  authController.logout.bind(authController),
);
router.get("/me", authenticate, authController.getMe.bind(authController));

export default router;
