/**
 * 404 Not Found Handler
 *
 * Catches requests to undefined routes and returns a consistent error response.
 * This middleware must be registered after all valid routes.
 *
 * OWASP Top 10 relevance:
 *   A05:2021 – Security Misconfiguration (avoid leaking framework-specific 404 pages)
 */

const HTTP_STATUS = require("../../constants/httpStatus");
const ERROR_CODES = require("../../constants/errorCodes");
const MESSAGES = require("../../constants/messages");
const { errorResponse } = require("../../utils/responseHelper");

/**
 * Express middleware for handling unmatched routes.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json(
    errorResponse(
      ERROR_CODES.NOT_FOUND,
      MESSAGES.NOT_FOUND
    )
  );
};

module.exports = notFoundHandler;
