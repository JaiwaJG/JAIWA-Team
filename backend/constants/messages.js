/**
 * Reusable Response Messages
 *
 * Centralized message strings to ensure consistency across the API
 * and to avoid duplicating text in multiple files.
 */

const MESSAGES = {
  // Generic
  SUCCESS: "Operation completed successfully.",
  ERROR: "An unexpected error occurred. Please try again later.",
  NOT_FOUND: "The requested resource could not be found.",
  METHOD_NOT_ALLOWED: "HTTP method not allowed for this route.",
  TOO_MANY_REQUESTS: "Too many requests. Please slow down and try again later.",
  VALIDATION_ERROR: "Request validation failed. Please check your input.",

  // Server / Config
  SERVER_ERROR: "Internal server error.",
  INVALID_CONFIGURATION: "Server configuration is invalid.",

  // Health / Root
  SERVER_RUNNING: "JAIWA Backend is running",
};

module.exports = MESSAGES;
