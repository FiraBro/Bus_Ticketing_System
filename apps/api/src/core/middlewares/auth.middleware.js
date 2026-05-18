import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import User from "../../modules/auth/auth.model.js";
export const validate = (schema) => (req, _res, next) => {
  try {
    // Parse only the slices defined by the schema (body, params, query).
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((issue) => ({
        // ← .issues not .errors
        field: issue.path.slice(1).join("."),
        message: issue.message,
      }));

      const validationError = new Error("Validation failed.");
      validationError.statusCode = 422;
      validationError.errors = errors;
      return next(validationError);
    }

    next(err);
  }
};

export const protect = async (req, _res, next) => {
  // 1. Extract token ----------------------------------------------------------
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error(
      "You are not logged in. Please log in to gain access.",
    );
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  // 2. Verify token -----------------------------------------------------------
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    const message = isExpired
      ? "Your session has expired. Please log in again."
      : "Invalid authentication token. Please log in again.";

    const error = new Error(message);
    error.statusCode = 401;
    return next(error);
  }

  // 3. Confirm user still exists & is active ----------------------------------
  // `active` is hidden by default (select: false), so we re-select it here.
  const currentUser = await User.findById(decoded.id).select("+active");

  if (!currentUser || !currentUser.active) {
    const error = new Error(
      "The account associated with this token no longer exists or has been deactivated.",
    );
    error.statusCode = 401;
    return next(error);
  }

  // 4. Grant access -----------------------------------------------------------
  req.user = currentUser;
  next();
};

export const restrictTo =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Access denied. This action is restricted to: ${roles.join(", ")}.`,
      );
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
