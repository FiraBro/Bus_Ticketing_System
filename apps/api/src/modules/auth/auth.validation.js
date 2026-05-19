import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared Field Definitions
// Centralised here so registration & login stay perfectly in sync.
// ---------------------------------------------------------------------------

const emailField = z
  .string({ required_error: "Email is required." })
  .email("Please provide a valid email address.")
  .toLowerCase()
  .trim();

const passwordField = z
  .string({ required_error: "Password is required." })
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must not exceed 72 characters."); // bcrypt hard limit

// ---------------------------------------------------------------------------
// Registration Schema
// ---------------------------------------------------------------------------

/**
 * Validates the request body for POST /auth/register.
 *
 * Accepted shape:
 * {
 *   name:     string  (1–60 chars)
 *   email:    string  (valid email)
 *   password: string  (8–72 chars)
 * }
 *
 * NOTE: `role` is intentionally excluded — the database default ('passenger')
 * is the only safe value for self-registration. Admins assign elevated roles
 * via a separate, protected endpoint.
 */
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required." })
      .trim()
      .min(1, "Name must not be empty.")
      .max(60, "Name must not exceed 60 characters."),

    email: emailField,

    password: passwordField,
  }),
});

// ---------------------------------------------------------------------------
// Login Schema
// ---------------------------------------------------------------------------

/**
 * Validates the request body for POST /auth/login.
 *
 * Accepted shape:
 * {
 *   email:    string  (valid email)
 *   password: string  (8–72 chars)
 * }
 */
export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
});

// ---------------------------------------------------------------------------
// Staff Creation Schema (Admin-Only Endpoint)
// ---------------------------------------------------------------------------

/**
 * Validates the request body for POST /auth/admin/create-staff.
 *
 * Accepted shape:
 * {
 *   name:     string  (1–60 chars)
 *   email:    string  (valid email)
 *   password: string  (8–72 chars)
 *   role:     string  ('admin' or 'operator')
 * }
 */
export const createStaffZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required." })
      .trim()
      .min(1, "Name must not be empty.")
      .max(60, "Name must not exceed 60 characters."),

    email: emailField,

    password: passwordField,

    role: z.enum(["admin", "operator"], {
      required_error: "Role is required for staff configuration.",
      invalid_type_error: "Role must be either 'admin' or 'operator'.",
    }),
  }),
});
