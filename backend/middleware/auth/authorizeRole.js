/**
 * Role Authorization Middleware
 *
 * Restricts route access to users with specific roles.
 * Must be used after the authenticate middleware.
 *
 * OWASP Top 10 relevance:
 *   A01:2021 – Broken Access Control
 */

const HTTP_STATUS = require("../../constants/httpStatus");
const ERROR_CODES = require("../../constants/errorCodes");
const { errorResponse } = require("../../utils/responseHelper");

/**
 * Creates a middleware that allows only the specified Prisma Role enum values.
 *
 * @param {string[]} allowedRoles - Allowed roles (e.g., ["USER"], ["MADU", "ADMIN"])
 * @returns {Function} Express middleware
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_CODES.UNAUTHORIZED, "Authentication required")
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse(ERROR_CODES.FORBIDDEN, "Access denied")
      );
    }

    next();
  };
};

module.exports = authorizeRole;
