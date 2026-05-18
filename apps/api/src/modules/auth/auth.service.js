// src/modules/auth/auth.service.js
import { env } from "../../config/env.js";
import jwt from "jsonwebtoken";
import User from "./auth.model.js";
import AppError from "../../core/utils/AppError.js";
import { hashToken } from "../../core/utils/hashToken.js";

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5");

const LOCK_TIME_MS = parseInt(process.env.LOCK_TIME_MS || `${15 * 60 * 1000}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const signToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

const sanitiseUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export const registerUser = async (data) => {
  const existing = await User.findOne({
    email: data.email,
  });

  if (existing) {
    throw new AppError("Email already registered.", 409);
  }

  // Prevent privilege escalation
  data.role = "passenger";

  const newUser = await User.create(data);

  return sanitiseUser(newUser);
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email,
  }).select("+password +loginAttempts +lockUntil");

  if (!user) {
    throw new AppError("Invalid credentials.", 401);
  }

  // Account lock protection
  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new AppError("Too many failed attempts. Try again later.", 423);
  }

  const isMatch = await user.correctPassword(password, user.password);

  if (!isMatch) {
    await user.incrementLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCK_TIME_MS);

    throw new AppError("Invalid credentials.", 401);
  }

  // Reset failed attempts after successful login
  await user.resetLoginAttempts();

  const accessToken = signToken(user._id);

  return {
    accessToken,
    user: sanitiseUser(user),
  };
};

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export const logoutUser = () => ({
  message: "Logged out successfully.",
});

// ---------------------------------------------------------------------------
// Forgot Password
// ---------------------------------------------------------------------------

export const forgotPasswordService = async (email) => {
  const GENERIC_RESPONSE = {
    message: "If that email exists, password reset is allowed.",
  };

  const user = await User.findOne({
    email,
  });

  // Prevent email enumeration
  if (!user) {
    return GENERIC_RESPONSE;
  }

  const resetToken = user.createResetPasswordToken();

  await user.save({
    validateBeforeSave: false,
  });

  return {
    message: "Password reset token generated successfully.",
    resetToken,
  };
};

// ---------------------------------------------------------------------------
// Reset Password
// ---------------------------------------------------------------------------

export const resetPasswordService = async (token, newPassword) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new AppError("Reset token is invalid or has expired.", 400);
  }

  user.password = newPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const accessToken = signToken(user._id);

  return {
    accessToken,
    user: sanitiseUser(user),
  };
};

// ---------------------------------------------------------------------------
// Change Password
// ---------------------------------------------------------------------------

export const changePasswordService = async (
  userId,
  oldPassword,
  newPassword,
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const isMatch = await user.correctPassword(oldPassword, user.password);

  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 400);
  }

  user.password = newPassword;

  await user.save();

  const accessToken = signToken(user._id);

  return {
    accessToken,
    user: sanitiseUser(user),
  };
};

// ---------------------------------------------------------------------------
// Get Current User
// ---------------------------------------------------------------------------

export const getMeService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("No user found with that ID.", 404);
  }

  return sanitiseUser(user);
};
