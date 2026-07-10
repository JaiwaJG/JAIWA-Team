/**
 * Application Logger Utility
 *
 * Provides structured logging for application events.
 * In production, logs are formatted as JSON for easier ingestion into log aggregation systems.
 * In development, logs are pretty-printed for readability.
 *
 * Security note: Never log sensitive data such as passwords, tokens, or personal information.
 */

const env = require("../config/env");

/**
 * Determines whether the current environment is production.
 * @returns {boolean}
 */
const isProduction = () => env.NODE_ENV === "production";

/**
 * Builds a structured log entry.
 *
 * @param {string} level - Log level (e.g., info, warn, error)
 * @param {string} message - Human-readable message
 * @param {object} [meta={}] - Additional structured metadata
 * @returns {object}
 */
const buildLogEntry = (level, message, meta = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level: level.toLowerCase(),
    message,
    environment: env.NODE_ENV,
    ...meta,
  };
};

/**
 * Outputs a log entry to the console.
 *
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} [meta={}] - Additional metadata
 */
const log = (level, message, meta = {}) => {
  const entry = buildLogEntry(level, message, meta);

  if (isProduction()) {
    // Production: output JSON for log aggregators
    console.log(JSON.stringify(entry));
    return;
  }

  // Development: pretty print
  const colorPrefix = {
    info: "\x1b[32m[INFO]\x1b[0m",
    warn: "\x1b[33m[WARN]\x1b[0m",
    error: "\x1b[31m[ERROR]\x1b[0m",
    debug: "\x1b[34m[DEBUG]\x1b[0m",
  }[level.toLowerCase()] || `[${level.toUpperCase()}]`;

  console.log(`${colorPrefix} ${entry.timestamp} - ${message}`);
  if (Object.keys(meta).length > 0) {
    console.log("Meta:", meta);
  }
};

const logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
  debug: (message, meta) => log("debug", message, meta),
};

module.exports = logger;
