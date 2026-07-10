/**
 * Authentication Routes
 *
 * Defines all authentication-related API endpoints.
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authenticate = require("../middleware/auth/authenticate");
const validateRequest = require("../middleware/validate/validateRequest");
const {
  registerSchema,
  loginSchema,
  emailSchema,
  verifyEmailSchema,
  passwordResetSchema,
  verifyResetCodeSchema,
  changePasswordSchema,
  profileUpdateSchema,
  emailChangeSchema,
  otpSchema,
  refreshTokenSchema,
} = require("../validators/authValidator");
const {
  authLimiter,
  passwordResetLimiter,
} = require("../middleware/security/rateLimiter");

// Public routes
router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", authLimiter, validateRequest(loginSchema), authController.login);
router.post("/madu-login", authLimiter, validateRequest(loginSchema), authController.maduLogin);
router.post("/refresh-token", validateRequest(refreshTokenSchema), authController.refreshToken);
router.post("/forgot-password", passwordResetLimiter, validateRequest(emailSchema), authController.forgotPassword);
router.post("/verify-reset-code", passwordResetLimiter, validateRequest(verifyResetCodeSchema), authController.verifyResetCode);
router.post("/reset-password", validateRequest(passwordResetSchema), authController.resetPassword);
router.post("/verify-email", authLimiter, validateRequest(verifyEmailSchema), authController.verifyEmail);
router.post("/resend-verification-code", authLimiter, validateRequest(emailSchema), authController.resendVerificationCode);

// Protected routes
router.get("/me", authenticate, authController.me);
router.get("/profile", authenticate, authController.profile);
router.put("/profile", authenticate, validateRequest(profileUpdateSchema), authController.updateProfile);
router.put("/change-password", authenticate, validateRequest(changePasswordSchema), authController.changePassword);
router.post("/send-email-change-code", authenticate, validateRequest(emailChangeSchema), authController.sendEmailChangeCode);
router.post("/verify-email-change", authenticate, validateRequest(otpSchema), authController.verifyEmailChange);
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);

module.exports = router;
