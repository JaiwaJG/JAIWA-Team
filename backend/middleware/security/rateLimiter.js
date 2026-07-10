/**
 * Rate Limiting Middleware
 *
 * Protects the API against brute-force, DDoS, and abuse by limiting
 * the number of requests a client can make within a time window.
 *
 * Uses express-rate-limit with different presets for general API usage
 * and sensitive authentication endpoints.
 *
 * OWASP Top 10 relevance:
 *   A07:2021 – Identification and Authentication Failures
 *   A05:2021 – Security Misconfiguration
 */

const rateLimit = require("express-rate-limit");
const env = require("../../config/env");
const ERROR_CODES = require("../../constants/errorCodes");
const MESSAGES = require("../../constants/messages");

/**
 * Builds a rate limit error response compatible with the frontend.
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @returns {object}
 */
const rateLimitHandler = (req, res) => {
  const resetTime = req.rateLimit.resetTime;
  const retryAfter = Math.max(
    1,
    Math.ceil((resetTime.getTime() - Date.now()) / 1000)
  );

  res.setHeader("Retry-After", retryAfter);

  return res.status(429).json({
    success: false,
    code: ERROR_CODES.TOO_MANY_REQUESTS,
    message: MESSAGES.TOO_MANY_REQUESTS,
    retryAfter,
    resetTime,
  });
};

/**
 * Standard API rate limiter.
 * Applied to all routes by default.
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
});

/**
 * Strict rate limiter for authentication routes.
 * Much lower threshold to mitigate credential stuffing and brute-force attacks.
 * Disabled in test environment to allow integration tests to run quickly.
 */
const authLimiter = env.isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Limit each IP to 10 auth requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      handler: rateLimitHandler,
    });

/**
 * Password reset flow rate limiter.
 * Limits how often a client can request password reset emails.
 * Disabled in test environment to allow integration tests to run quickly.
 */
const passwordResetLimiter = env.isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // Limit each IP to 5 password reset requests per hour
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitHandler,
    });

module.exports = {
  standardLimiter,
  authLimiter,
  passwordResetLimiter,
};
