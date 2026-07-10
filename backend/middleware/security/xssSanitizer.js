/**
 * XSS Sanitization Middleware
 *
 * Sanitizes request body, query parameters, and route parameters
 * to mitigate Cross-Site Scripting (XSS) attacks.
 *
 * This middleware runs after body parsing and before route handlers.
 *
 * OWASP Top 10 relevance: A03:2021 – Injection (XSS)
 */

const { sanitize } = require("../../utils/xssSanitizer");

/**
 * Express middleware that sanitizes incoming request data.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const xssSanitizerMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query);
  }

  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

module.exports = xssSanitizerMiddleware;
