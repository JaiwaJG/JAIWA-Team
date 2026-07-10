/**
 * Authentication Controller
 *
 * Thin HTTP layer for authentication endpoints.
 * All business logic is delegated to services.
 */

const authService = require("../services/authService");
const userService = require("../services/userService");
const HTTP_STATUS = require("../constants/httpStatus");
const { successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Extracts client info for refresh token metadata.
 *
 * @param {object} req - Express request
 * @returns {object} Client info
 */
const getClientInfo = (req) => ({
  ipAddress: req.ip || req.connection.remoteAddress || null,
  userAgent: req.headers["user-agent"] || null,
});

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    successResponse("Registration successful. Please check your email for the verification code.", {
      email: result.email,
      expiresAt: result.expiresAt,
    })
  );
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { ipAddress, userAgent } = getClientInfo(req);
  const result = await authService.login(
    req.body,
    ["USER"],
    ipAddress,
    userAgent
  );

  res.status(HTTP_STATUS.OK).json(
    successResponse("Login successful.", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })
  );
});

/**
 * POST /api/auth/madu-login
 */
const maduLogin = asyncHandler(async (req, res) => {
  const { ipAddress, userAgent } = getClientInfo(req);
  const result = await authService.login(
    req.body,
    ["MADU", "ADMIN"],
    ipAddress,
    userAgent
  );

  res.status(HTTP_STATUS.OK).json(
    successResponse("Madu login successful.", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })
  );
});

/**
 * GET /api/auth/me
 */
const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);

  res.status(HTTP_STATUS.OK).json(successResponse("User fetched successfully", { user }));
});

/**
 * GET /api/auth/profile
 */
const profile = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);

  res.status(HTTP_STATUS.OK).json(successResponse("Profile fetched successfully", { user }));
});

/**
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.userId, req.body);

  res.status(HTTP_STATUS.OK).json(
    successResponse("Profile updated successfully", { user })
  );
});

/**
 * POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const { ipAddress, userAgent } = getClientInfo(req);

  const result = await authService.refreshAccessToken(
    refreshToken,
    ipAddress,
    userAgent
  );

  res.status(HTTP_STATUS.OK).json(
    successResponse("Token refreshed successfully", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    })
  );
});

/**
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await authService.changePassword(req.user.userId, oldPassword, newPassword);

  res.status(HTTP_STATUS.OK).json(
    successResponse("Password changed successfully")
  );
});

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);

  res.status(HTTP_STATUS.OK).json(
    successResponse("If an account exists, a password reset code has been sent.")
  );
});

/**
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  await authService.resetPassword({ email, code, newPassword });

  res.status(HTTP_STATUS.OK).json(
    successResponse("Password reset successfully")
  );
});

/**
 * POST /api/auth/verify-email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  await authService.verifyEmail({ email, code });

  res.status(HTTP_STATUS.OK).json(
    successResponse("Email verified successfully")
  );
});

/**
 * POST /api/auth/send-email-change-code
 */
const sendEmailChangeCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.sendEmailChangeCode(req.user.userId, email);

  res.status(HTTP_STATUS.OK).json(
    successResponse("Verification code sent successfully")
  );
});

/**
 * POST /api/auth/verify-email-change
 */
const verifyEmailChange = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const user = await authService.verifyEmailChange(req.user.userId, otp);

  res.status(HTTP_STATUS.OK).json(
    successResponse("Email changed successfully", { user })
  );
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  await authService.logout(req.user.userId, refreshToken);

  res.status(HTTP_STATUS.OK).json(successResponse("Logout successful."));
});

/**
 * POST /api/auth/logout-all
 */
const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.userId);

  res.status(HTTP_STATUS.OK).json(
    successResponse("Logged out from all devices successfully")
  );
});

/**
 * POST /api/auth/resend-verification-code
 */
const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendVerificationCode(email);

  res.status(HTTP_STATUS.OK).json(
    successResponse("If an account exists, a new verification code has been sent.", {
      expiresAt: result.expiresAt,
    })
  );
});

/**
 * POST /api/auth/verify-reset-code
 */
const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const result = await authService.verifyResetCode({ email, code });

  res.status(HTTP_STATUS.OK).json(
    successResponse("Reset code verified successfully", {
      email: result.email,
    })
  );
});

module.exports = {
  register,
  login,
  maduLogin,
  me,
  profile,
  updateProfile,
  refreshToken,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
  sendEmailChangeCode,
  verifyEmailChange,
  logout,
  logoutAll,
};

