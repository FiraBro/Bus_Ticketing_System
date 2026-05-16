import { z } from "zod";

// ── Register ───────────────────────────────────────────────────────────────

export const RegisterDto = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must not exceed 60 characters."),

  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Invalid email address."),

  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must not exceed 128 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

// ── Login ──────────────────────────────────────────────────────────────────

export const LoginDto = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Invalid email address."),

  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

// ── Inferred Types ─────────────────────────────────────────────────────────

export type RegisterBody = z.infer<typeof RegisterDto>;
export type LoginBody = z.infer<typeof LoginDto>;
