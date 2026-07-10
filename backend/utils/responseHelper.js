/**
 * API Response Helpers
 *
 * Enforces the consistent response format required by the JAIWA Team API:
 *
 * Success: { success: true, message: "...", data: {} }
 * Error:   { success: false, code: "...", message: "..." }
 */

const MESSAGES = require("../constants/messages");

/**
 * Builds a successful API response.
 *
 * @param {string} [message=MESSAGES.SUCCESS] - Human-readable success message
 * @param {object} [data={}] - Response payload
 * @returns {object}
 */
const successResponse = (message = MESSAGES.SUCCESS, data = {}) => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Builds an error API response.
 *
 * @param {string} code - Machine-readable error code
 * @param {string} message - Human-readable error message
 * @returns {object}
 */
const errorResponse = (code, message) => {
  return {
    success: false,
    code,
    message,
  };
};

module.exports = {
  successResponse,
  errorResponse,
};
