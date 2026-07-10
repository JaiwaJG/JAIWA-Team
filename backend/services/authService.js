/**
 * Authentication Service
 *
 * Contains all authentication business logic.
 * Controllers call these functions and are responsible only for HTTP responses.
 *
 * Features:
 *   - Registration with email verification
 *   - Login with role-based access
 *   - JWT access token + refresh token rotation
 *   - Logout (current device / all devices)
 *   - Password reset and change
 *   - Email change verification
 *
 * OWASP Top 10 relevance:
 *   A03:2021 – Injection (input validation handled by validators)
 *   A07:2021 – Identification and Authentication Failures
 */

const prisma = require("../config/database");
const userService = require("./userService");
const passwordService = require("./passwordService");
const tokenService = require("./tokenService");
const emailService = require("./emailService");
const env = require("../config/env");
const HTTP_STATUS = require("../constants/httpStatus");
const ERROR_CODES = require("../constants/errorCodes");
const { generateOTP } = require("../utils/generateOTP");
const { generateCode, hashCode } = require("../utils/codeGenerator");
const logger = require("../utils/logger");

/**
 * Sanitizes a user object for API responses.
 * Removes sensitive fields like password.
 *
 * @param {object} user - Raw user record
 * @returns {object} Sanitized user object
 */
const sanitizeUser = (user) => {
  const {
    password,
    verifyTokenHash,
    verifyTokenExpiry,
    resetTokenHash,
    resetTokenExpiry,
    emailChangeTokenHash,
    emailChangeEmail,
    emailChangeExpiresAt,
    ...safeUser
  } = user;

  // Convert Role enum to lowercase string for frontend compatibility
  if (safeUser.role) {
    safeUser.role = safeUser.role.toLowerCase();
  }

  return safeUser;
};

/**
 * Generates access and refresh tokens for a user.
 *
 * @param {object} user - User record
 * @param {string} ipAddress - Client IP
 * @param {string} userAgent - Client user agent
 * @returns {Promise<object>} Tokens and expiry info
 */
const generateAuthTokens = async (user, ipAddress, userAgent) => {
  const accessToken = tokenService.generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshTokenPlain = tokenService.generateRefreshToken();
  const refreshExpiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRY_SECONDS * 1000
  );

  await tokenService.createRefreshToken(
    user.id,
    refreshTokenPlain,
    refreshExpiresAt,
    ipAddress,
    userAgent
  );

  return {
    accessToken,
    refreshToken: refreshTokenPlain,
    expiresIn: env.ACCESS_TOKEN_EXPIRY_SECONDS,
  };
};

/**
 * Registers a new user.
 *
 * @param {object} data - Registration data
 * @param {string} data.username - Username
 * @param {string} data.email - Email
 * @param {string} data.password - Password
 * @returns {Promise<object>} Created user and verification token
 */
const VERIFICATION_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const register = async ({ username, email, password }) => {
  const verifiedEmailUser = await userService.findUserByEmail(email);
  if (verifiedEmailUser) {
    const error = new Error("Email already exists");
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.code = ERROR_CODES.EMAIL_ALREADY_EXISTS;
    throw error;
  }

  const verifiedUsernameUser = await userService.findUserByUsername(username);
  if (verifiedUsernameUser) {
    const error = new Error("Username already exists");
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.code = ERROR_CODES.USER_ALREADY_EXISTS;
    throw error;
  }

  const hashedPassword = await passwordService.hashPassword(password);
  const verificationCode = generateCode();
  const verifyTokenExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS);

  const existingPendingUser = await prisma.pendingUser.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    },
  });

  if (existingPendingUser) {
    const updatedPendingUser = await prisma.pendingUser.update({
      where: { id: existingPendingUser.id },
      data: {
        username,
        email,
        password: hashedPassword,
        verifyTokenHash: hashCode(verificationCode),
        verifyTokenExpiry,
      },
    });

    emailService
      .sendVerificationEmail(
        updatedPendingUser.email,
        updatedPendingUser.username,
        verificationCode
      )
      .catch((error) => {
        logger.error("Failed to send verification email", {
          pendingUserId: updatedPendingUser.id,
          error: error.message,
        });
      });

    return {
      email: updatedPendingUser.email,
      expiresAt: verifyTokenExpiry,
    };
  }

  const pendingPayload = {
    username,
    email,
    password: hashedPassword,
    role: "USER",
    verifyTokenHash: hashCode(verificationCode),
    verifyTokenExpiry,
  };

  const registration = await prisma.pendingUser.create({ data: pendingPayload });

  emailService
    .sendVerificationEmail(registration.email, registration.username, verificationCode)
    .catch((error) => {
      logger.error("Failed to send verification email", {
        pendingUserId: registration.id,
        error: error.message,
      });
    });

  return {
    email: registration.email,
    expiresAt: verifyTokenExpiry,
  };
};

/**
 * Authenticates a user and issues tokens.
 *
 * @param {object} data - Login data
 * @param {string} data.email - Email
 * @param {string} data.password - Password
 * @param {string[]} allowedRoles - Allowed Prisma Role enum values
 * @param {string} ipAddress - Client IP
 * @param {string} userAgent - Client user agent
 * @returns {Promise<object>} User and tokens
 */
const login = async ({ email, password }, allowedRoles, ipAddress, userAgent) => {
  const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });

  if (pendingUser) {
    const error = new Error("Please verify your email before logging in.");
    error.statusCode = HTTP_STATUS.FORBIDDEN;
    error.code = ERROR_CODES.EMAIL_NOT_VERIFIED;
    throw error;
  }

  const user = await userService.findUserByEmail(email);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.code = ERROR_CODES.USER_NOT_FOUND;
    throw error;
  }

  if (!allowedRoles.includes(user.role)) {
    const error = new Error(
      user.role === "USER" ? "Please use User Login." : "Please use Madu Login."
    );
    error.statusCode = HTTP_STATUS.FORBIDDEN;
    error.code = ERROR_CODES.FORBIDDEN;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error("Please verify your email before logging in.");
    error.statusCode = HTTP_STATUS.FORBIDDEN;
    error.code = ERROR_CODES.EMAIL_NOT_VERIFIED;
    throw error;
  }

  const isPasswordValid = await passwordService.comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Incorrect password.");
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = ERROR_CODES.INVALID_CREDENTIALS;
    throw error;
  }

  const tokens = await generateAuthTokens(user, ipAddress, userAgent);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

/**
 * Logs out a user from the current device by revoking the refresh token.
 *
 * @param {string} userId - User ID
 * @param {string} refreshToken - Plaintext refresh token
 * @returns {Promise<void>}
 */
const logout = async (userId, refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const record = await tokenService.validateRefreshToken(refreshToken);

  if (record && record.userId === userId) {
    await tokenService.revokeRefreshToken(record.id);
  }
};

/**
 * Logs out a user from all devices by revoking all refresh tokens.
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const logoutAll = async (userId) => {
  await tokenService.revokeAllUserRefreshTokens(userId);
};

/**
 * Refreshes the access token using a refresh token.
 * Rotates the refresh token for security.
 *
 * @param {string} refreshToken - Plaintext refresh token
 * @param {string} ipAddress - Client IP
 * @param {string} userAgent - Client user agent
 * @returns {Promise<object>} New access and refresh tokens
 */
const refreshAccessToken = async (refreshToken, ipAddress, userAgent) => {
  const record = await tokenService.validateRefreshToken(refreshToken);

  if (!record) {
    const error = new Error("Invalid or expired refresh token.");
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = ERROR_CODES.INVALID_TOKEN;
    throw error;
  }

  const user = await userService.findUserById(record.userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = ERROR_CODES.USER_NOT_FOUND;
    throw error;
  }

  const newRefreshTokenPlain = tokenService.generateRefreshToken();
  const newExpiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRY_SECONDS * 1000
  );

  await tokenService.rotateRefreshToken(
    record,
    newRefreshTokenPlain,
    newExpiresAt,
    ipAddress,
    userAgent
  );

  const accessToken = tokenService.generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken: newRefreshTokenPlain,
    expiresIn: env.ACCESS_TOKEN_EXPIRY_SECONDS,
  };
};

/**
 * Verifies a user's email address.
 *
 * @param {string} token - Verification token
 * @returns {Promise<object>} Updated user
 */
const verifyEmail = async ({ email, code }) => {
  const codeHash = hashCode(code);

  const pendingUser = await prisma.pendingUser.findFirst({
    where: {
      email,
      verifyTokenHash: codeHash,
      verifyTokenExpiry: { gt: new Date() },
    },
  });

  if (!pendingUser) {
    const error = new Error("Invalid or expired verification code");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.INVALID_TOKEN;
    throw error;
  }

  const user = await userService.createUser({
    username: pendingUser.username,
    email: pendingUser.email,
    password: pendingUser.password,
    role: pendingUser.role,
    isVerified: true,
    verifyTokenHash: null,
    verifyTokenExpiry: null,
  });

  await prisma.pendingUser.delete({ where: { id: pendingUser.id } });

  return sanitizeUser(user);
};

/**
 * Resends a verification code to the user's email.
 *
 * @param {string} email - User email
 * @returns {Promise<object>} New verification expiry
 */
const resendVerificationCode = async (email) => {
  const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });

  if (!pendingUser) {
    return { expiresAt: null };
  }

  const verificationCode = generateCode();
  const verifyTokenExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS);

  await prisma.pendingUser.update({
    where: { id: pendingUser.id },
    data: {
      verifyTokenHash: hashCode(verificationCode),
      verifyTokenExpiry,
    },
  });

  emailService
    .sendVerificationEmail(pendingUser.email, pendingUser.username, verificationCode)
    .catch((error) => {
      logger.error("Failed to send verification email", {
        pendingUserId: pendingUser.id,
        error: error.message,
      });
    });

  return { expiresAt: verifyTokenExpiry };
};

const RESET_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Initiates a password reset flow.
 *
 * @param {string} email - User email
 * @returns {Promise<object>} Success message
 */
const forgotPassword = async (email) => {
  const user = await userService.findUserByEmail(email);

  if (!user) {
    // Return generic success to prevent email enumeration
    return { expiresAt: null };
  }

  const resetCode = generateCode();
  const resetTokenExpiry = new Date(Date.now() + RESET_CODE_EXPIRY_MS);

  await userService.updateUser(user.id, {
    resetTokenHash: hashCode(resetCode),
    resetTokenExpiry,
  });

  emailService
    .sendPasswordResetEmail(user.email, user.username, resetCode)
    .catch((error) => {
      logger.error("Failed to send password reset email", {
        userId: user.id,
        error: error.message,
      });
    });

  return { message: "If the email exists, a reset code has been sent." };
};

/**
 * Verifies a password reset code.
 *
 * @param {string} email - User email
 * @param {string} code - Reset code
 * @returns {Promise<object>} Updated user
 */
const verifyResetCode = async ({ email, code }) => {
  const codeHash = hashCode(code);

  const user = await prisma.user.findFirst({
    where: {
      email,
      resetTokenHash: codeHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired reset code");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.INVALID_RESET_TOKEN;
    throw error;
  }

  return sanitizeUser(user);
};

/**
 * Resets a user's password using a reset code.
 *
 * @param {string} email - User email
 * @param {string} code - Reset code
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Updated user
 */
const resetPassword = async ({ email, code, newPassword }) => {
  const codeHash = hashCode(code);

  const user = await prisma.user.findFirst({
    where: {
      email,
      resetTokenHash: codeHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired reset code");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.INVALID_RESET_TOKEN;
    throw error;
  }

  const isSamePassword = await passwordService.comparePassword(
    newPassword,
    user.password
  );

  if (isSamePassword) {
    const error = new Error("New password must be different from current password");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.PASSWORDS_DO_NOT_MATCH;
    throw error;
  }

  const hashedPassword = await passwordService.hashPassword(newPassword);

  const updatedUser = await userService.updateUser(user.id, {
    password: hashedPassword,
    resetTokenHash: null,
    resetTokenExpiry: null,
  });

  // Revoke all refresh tokens after password reset for security
  await tokenService.revokeAllUserRefreshTokens(user.id);

  return sanitizeUser(updatedUser);
};

/**
 * Changes a user's password after verifying the old password.
 *
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userService.findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.code = ERROR_CODES.USER_NOT_FOUND;
    throw error;
  }

  const isOldPasswordValid = await passwordService.comparePassword(
    oldPassword,
    user.password
  );

  if (!isOldPasswordValid) {
    const error = new Error("Old password is incorrect");
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.code = ERROR_CODES.INVALID_CREDENTIALS;
    throw error;
  }

  const isSamePassword = await passwordService.comparePassword(
    newPassword,
    user.password
  );

  if (isSamePassword) {
    const error = new Error("New password must be different from old password");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.PASSWORDS_DO_NOT_MATCH;
    throw error;
  }

  const hashedPassword = await passwordService.hashPassword(newPassword);

  await userService.updateUser(userId, { password: hashedPassword });

  // Revoke all refresh tokens after password change for security
  await tokenService.revokeAllUserRefreshTokens(userId);
};

/**
 * Gets the current authenticated user.
 *
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Sanitized user or null
 */
const getCurrentUser = async (userId) => {
  const user = await userService.findUserById(userId);
  return user ? sanitizeUser(user) : null;
};

/**
 * Updates a user's profile.
 *
 * @param {string} userId - User ID
 * @param {object} data - Update data
 * @param {string} [data.username] - New username
 * @param {string} [data.email] - New email
 * @returns {Promise<object>} Updated user
 */
const updateProfile = async (userId, { username, email }) => {
  const updateData = {};

  if (username !== undefined) {
    updateData.username = username;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  const updatedUser = await userService.updateUser(userId, updateData);
  return sanitizeUser(updatedUser);
};

/**
 * Sends an email change verification code.
 *
 * @param {string} userId - User ID
 * @param {string} newEmail - New email address
 * @returns {Promise<void>}
 */
const sendEmailChangeCode = async (userId, newEmail) => {
  const user = await userService.findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.code = ERROR_CODES.USER_NOT_FOUND;
    throw error;
  }

  const otp = generateOTP();
  const hashedOTP = await passwordService.hashPassword(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await userService.updateUser(userId, {
    emailChangeTokenHash: hashedOTP,
    emailChangeEmail: newEmail,
    emailChangeExpiresAt: expiresAt,
  });

  emailService
    .sendEmailChangeCode(newEmail, user.username, otp)
    .catch((error) => {
      logger.error("Failed to send email change code", {
        userId,
        error: error.message,
      });
    });
};

/**
 * Verifies an email change OTP and updates the user's email.
 *
 * @param {string} userId - User ID
 * @param {string} otp - Verification code
 * @returns {Promise<object>} Updated user
 */
const verifyEmailChange = async (userId, otp) => {
  const user = await userService.findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.code = ERROR_CODES.USER_NOT_FOUND;
    throw error;
  }

  if (!user.emailChangeTokenHash || !user.emailChangeEmail) {
    const error = new Error("No verification request found");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.INVALID_TOKEN;
    throw error;
  }

  if (user.emailChangeExpiresAt < new Date()) {
    const error = new Error("Verification code has expired");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.EXPIRED_RESET_TOKEN;
    throw error;
  }

  const isValidOTP = await passwordService.comparePassword(
    otp,
    user.emailChangeTokenHash
  );

  if (!isValidOTP) {
    const error = new Error("Invalid verification code");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.code = ERROR_CODES.INVALID_TOKEN;
    throw error;
  }

  const updatedUser = await userService.updateUser(userId, {
    email: user.emailChangeEmail,
    emailChangeTokenHash: null,
    emailChangeEmail: null,
    emailChangeExpiresAt: null,
  });

  return sanitizeUser(updatedUser);
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshAccessToken,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateProfile,
  sendEmailChangeCode,
  verifyEmailChange,
  sanitizeUser,
  generateAuthTokens,
};
