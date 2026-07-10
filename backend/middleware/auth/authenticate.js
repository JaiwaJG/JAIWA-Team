/**
 * Authentication Middleware
 *
 * Verifies the JWT access token from the Authorization header.
 * Attaches the decoded user payload to the request object.
 *
 * OWASP Top 10 relevance:
 *   A07:2021 – Identification and Authentication Failures
 */

const tokenService = require("../../services/tokenService");
const userService = require("../../services/userService");
const HTTP_STATUS = require("../../constants/httpStatus");
const ERROR_CODES = require("../../constants/errorCodes");
const { errorResponse } = require("../../utils/responseHelper");

/**
 * Express middleware that authenticates requests via JWT.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_CODES.MISSING_TOKEN, "Access token required")
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_CODES.INVALID_TOKEN, "Invalid token")
      );
    }

    const decoded = tokenService.verifyAccessToken(token);

    const user = await userService.findUserById(decoded.userId);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_CODES.USER_NOT_FOUND, "User not found")
      );
    }

    //debug
    console.log("ROLE =", user.role);

    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_CODES.TOKEN_EXPIRED, "Token expired")
      );
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse(ERROR_CODES.INVALID_TOKEN, "Invalid token")
      );
    }

    next(error);
  }
};

module.exports = authenticate;
