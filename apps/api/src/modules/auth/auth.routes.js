import { Router } from "express";
import { register, login, registerStaff } from "./auth.controller.js";
import {
  registerSchema,
  loginSchema,
  createStaffZodSchema,
} from "./auth.validation.js";
import {
  validate,
  protect,
  restrictTo,
} from "../../core/middlewares/auth.middleware.js";
// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);
router.post(
  "/admin/create-staff",
  protect,
  restrictTo("admin"),
  validate(createStaffZodSchema),
  registerStaff,
);

export default router;
