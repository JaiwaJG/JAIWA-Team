/**
 * Centralized Error Handler
 *
 * Catches all errors thrown in the application and converts them into
 * the standardized API error response format:
 *
 *   { success: false, code: "...", message: "..." }
 *
 * This prevents stack traces from leaking in production and ensures
 * consistent error handling across the entire API.
 *
 * OWASP Top 10 relevance:
 *   A05:2021 – Security Misconfiguration
 *   A09:2021 – Security Logging and Monitoring Failures
 */

const env = require("../../config/env");
const HTTP_STATUS = require("../../constants/httpStatus");
const ERROR_CODES = require("../../constants/errorCodes");
const MESSAGES = require("../../constants/messages");
const { errorResponse } = require("../../utils/responseHelper");
const logger = require("../../utils/logger");

/**
 * Extracts a safe HTTP status code from an error object.
 *
 * @param {Error} err - Error instance
 * @returns {number}
 */
const getStatusCode = (err) => {
  if (err.statusCode && Number.isInteger(err.statusCode)) {
    return err.statusCode;
  }

  if (err.status && Number.isInteger(err.status)) {
    return err.status;
  }

  return HTTP_STATUS.INTERNAL_SERVER_ERROR;
};

/**
 * Extracts a safe error code from an error object.
 *
 * @param {Error} err - Error instance
 * @returns {string}
 */
const getErrorCode = (err) => {
  return err.code || ERROR_CODES.INTERNAL_ERROR;
};

/**
 * Express centralized error handling middleware.
 *
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function (required by Express for error handlers)
 */
const centralErrorHandler = (err, req, res, next) => {
  const statusCode = getStatusCode(err);
  const errorCode = getErrorCode(err);

  // Determine the safe message to send to the client
  const isServerError = statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = isServerError && env.isProduction
    ? MESSAGES.ERROR
    : err.message || MESSAGES.ERROR;

  // Log the error with request context for security monitoring
  logger.error(err.message || MESSAGES.ERROR, {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode,
    errorCode,
    stack: env.isProduction ? undefined : err.stack,
  });

  // In development, include stack trace separately for debugging
  const response = errorResponse(errorCode, message);

  if (!env.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = centralErrorHandler;
