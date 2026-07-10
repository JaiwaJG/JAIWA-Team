/**
 * Request Validation Middleware
 *
 * Validates request body against a Joi schema.
 * Returns a consistent validation error response on failure.
 *
 * OWASP Top 10 relevance:
 *   A03:2021 – Injection (input validation)
 */

const HTTP_STATUS = require("../../constants/httpStatus");
const ERROR_CODES = require("../../constants/errorCodes");
const MESSAGES = require("../../constants/messages");
const { errorResponse } = require("../../utils/responseHelper");

/**
 * Creates an Express middleware that validates the request body.
 *
 * @param {object} schema - Joi schema
 * @param {string} [source="body"] - Request property to validate (body, query, params)
 * @returns {Function} Express middleware
 */
const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (!error) {
      return next();
    }

    const message = error.details.map((detail) => detail.message).join(". ");

    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(ERROR_CODES.VALIDATION_ERROR, message)
    );
  };
};

module.exports = validateRequest;
