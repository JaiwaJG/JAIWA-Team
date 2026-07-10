/**
 * Common Validation Helpers
 *
 * Shared validation rules used across multiple request validators.
 */

const Joi = require("joi");

/**
 * Email validation rule.
 */
const email = Joi.string().email().max(255).lowercase().trim().messages({
  "string.email": "Please enter a valid email address.",
  "string.empty": "Email is required.",
  "string.max": "Email must not exceed 255 characters.",
  "any.required": "Email is required.",
});

/**
 * Password validation rule.
 * Enforces the same rules as validators/passwordValidator.js:
 * - 8-14 characters
 * - At least one uppercase, lowercase, digit, and special character
 */
const password = Joi.string()
  .min(8)
  .max(24)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]+$/)
  .messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters.",
    "string.max": "Password must not exceed 24 characters.",
    "string.pattern.base":
      "Password must contain uppercase, lowercase, number and special character.",
    "any.required": "Password is required.",
  });

/**
 * Username validation rule.
 * Enforces the same rules as validators/usernameValidator.js:
 * - 3-20 characters
 * - Only letters, numbers, and underscores
 */
const username = Joi.string()
  .min(3)
  .max(20)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .trim()
  .messages({
    "string.empty": "Username is required.",
    "string.min": "Username must be at least 3 characters.",
    "string.max": "Username must not exceed 20 characters.",
    "string.pattern.base": "Username can only contain letters, numbers and underscore.",
    "any.required": "Username is required.",
  });

/**
 * UUID/CUID token validation rule.
 * Used for hex tokens like verification and reset tokens.
 */
const hexToken = Joi.string().hex().length(64).required().messages({
  "string.empty": "Token is required.",
  "string.hex": "Invalid token format.",
  "string.length": "Invalid token format.",
  "any.required": "Token is required.",
});

/**
 * Human-friendly 8-character code validation rule.
 * Allowed characters exclude visually ambiguous O, 0, I, 1, L.
 */
const secureCode = Joi.string()
  .length(8)
  .pattern(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
  .uppercase()
  .messages({
    "string.empty": "Code is required.",
    "string.length": "Code must be 8 characters.",
    "string.pattern.base": "Invalid code format.",
    "any.required": "Code is required.",
  });

module.exports = {
  email,
  password,
  username,
  hexToken,
  secureCode,
};
