/**
 * Authentication Request Validators
 *
 * Joi schemas for all authentication endpoints.
 * Controllers use these via the validateRequest middleware.
 */

const Joi = require("joi");
const { email, password, username, hexToken, secureCode } = require("./commonValidator");

/**
 * Registration schema.
 */
const registerSchema = Joi.object({
  username: username.required(),
  email: email.required(),
  password: password.required(),
});

/**
 * Login schema.
 */
const loginSchema = Joi.object({
  email: email.required(),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});

/**
 * Email-only schema (for forgot-password, resend verification, etc.).
 */
const emailSchema = Joi.object({
  email: email.required(),
});

/**
 * Token-only schema (for legacy token-based flows if still needed).
 */
const tokenSchema = Joi.object({
  token: hexToken,
});

/**
 * Email verification schema.
 */
const verifyEmailSchema = Joi.object({
  email: email.required(),
  code: secureCode.required(),
});

/**
 * Password reset schema.
 */
const passwordResetSchema = Joi.object({
  email: email.required(),
  code: secureCode.required(),
  newPassword: password.required(),
});

/**
 * Change password schema.
 */
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.empty": "Old password is required.",
    "any.required": "Old password is required.",
  }),
  newPassword: password.required(),
});

/**
 * Profile update schema.
 */
const profileUpdateSchema = Joi.object({
  username: username,
  email: email,
})
  .min(1)
  .messages({
    "object.min": "At least one field is required.",
  });

/**
 * Email change request schema.
 */
const emailChangeSchema = Joi.object({
  email: email.required(),
});

/**
 * OTP verification schema.
 */
const otpSchema = Joi.object({
  otp: Joi.string().length(8).alphanum().uppercase().required().messages({
    "string.empty": "Verification code is required.",
    "string.length": "Verification code must be 8 characters.",
    "string.alphanum": "Invalid verification code.",
    "any.required": "Verification code is required.",
  }),
});

/**
 * Refresh token schema.
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token is required.",
    "any.required": "Refresh token is required.",
  }),
});

/**
 * Reset-code verification schema.
 */
const verifyResetCodeSchema = Joi.object({
  email: email.required(),
  code: secureCode.required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  emailSchema,
  tokenSchema,
  verifyEmailSchema,
  passwordResetSchema,
  verifyResetCodeSchema,
  changePasswordSchema,
  profileUpdateSchema,
  emailChangeSchema,
  otpSchema,
  refreshTokenSchema,
};
