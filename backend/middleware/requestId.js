/**
 * Request ID Middleware
 *
 * Assigns a unique request ID to every incoming request using crypto.randomUUID.
 * This ID is attached to the request object and the response header `X-Request-ID`,
 * enabling request tracing through logs for debugging and security auditing.
 *
 * OWASP Top 10 relevance:
 *   A09:2021 – Security Logging and Monitoring Failures
 */

const { randomUUID } = require("crypto");

/**
 * Express middleware that generates and attaches a request ID.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = req.get("X-Request-ID") || randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  next();
};

module.exports = requestIdMiddleware;
