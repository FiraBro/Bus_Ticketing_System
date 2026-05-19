// =============================================================================
// src/modules/auth/auth.controller.js
// =============================================================================

import catchAsync from "../../core/utils/catchAsync.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
  getMeService,
} from "./auth.service.js";

// =============================================================================
// Helper
// =============================================================================

const sendResponse = (res, statusCode, data = null, message = null) => {
  return res.status(statusCode).json({
    status: "success",
    ...(message && { message }),
    ...(data && { data }),
  });
};

// =============================================================================
// Register
// =============================================================================

export const register = catchAsync(async (req, res) => {
  const user = await registerUser(req.body);

  sendResponse(res, 201, { user }, "Registration successful.");
});

// =============================================================================
// Login
// =============================================================================

export const login = catchAsync(async (req, res) => {
  const { accessToken, user } = await loginUser(req.body);

  sendResponse(res, 200, {
    accessToken,
    user,
  });
});

// =============================================================================
// Logout
// =============================================================================

export const logout = catchAsync(async (req, res) => {
  const result = await logoutUser();

  sendResponse(res, 200, null, result.message);
});

// =============================================================================
// Forgot Password
// =============================================================================

export const forgotPassword = catchAsync(async (req, res) => {
  const result = await forgotPasswordService(req.body.email);

  sendResponse(
    res,
    200,
    {
      resetToken: result.resetToken,
    },
    result.message,
  );
});

// =============================================================================
// Reset Password
// =============================================================================

export const resetPassword = catchAsync(async (req, res) => {
  const { accessToken, user } = await resetPasswordService(
    req.params.token,
    req.body.password,
  );

  sendResponse(
    res,
    200,
    {
      accessToken,
      user,
    },
    "Password reset successful.",
  );
});

// =============================================================================
// Change Password
// =============================================================================

export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const { accessToken, user } = await changePasswordService(
    req.user.id,
    oldPassword,
    newPassword,
  );

  sendResponse(
    res,
    200,
    {
      accessToken,
      user,
    },
    "Password changed successfully.",
  );
});

// =============================================================================
// Get Current User
// =============================================================================

export const getMe = catchAsync(async (req, res) => {
  const user = await getMeService(req.user.id);

  sendResponse(res, 200, {
    user,
  });
});

import { createStaffUser } from "./auth.service.js";

export const registerStaff = async (req, res) => {
  const staff = await createStaffUser(req.body);
  res.status(201).json({
    status: "success",
    data: { user: staff },
  });
};
