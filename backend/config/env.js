/**
 * Environment Configuration & Validator
 *
 * Loads environment variables from .env and validates required values.
 * The application fails fast on startup if critical configuration is missing.
 *
 * Security:
 *   - Never hardcodes secrets
 *   - Validates required environment variables before the server starts
 *   - Provides typed helpers to avoid scattered process.env access
 *
 * OWASP Top 10 relevance:
 *   A05:2021 – Security Misconfiguration
 */

require("dotenv").config();

/**
 * Reads an environment variable and returns a default if not set.
 *
 * @param {string} key - Environment variable name
 * @param {*} [defaultValue=undefined] - Fallback value
 * @returns {string|undefined}
 */
const getEnv = (key, defaultValue = undefined) => {
  return process.env[key] || defaultValue;
};

/**
 * Reads a required environment variable.
 * Throws an error if the variable is missing or empty.
 *
 * @param {string} key - Environment variable name
 * @returns {string}
 */
const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
};

/**
 * Parses a boolean string from environment variables.
 *
 * @param {string} value - Raw env value
 * @param {boolean} [defaultValue=false] - Fallback value
 * @returns {boolean}
 */
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return ["true", "1", "yes"].includes(value.toLowerCase());
};

/**
 * Parses an integer from environment variables.
 *
 * @param {string} value - Raw env value
 * @param {number} defaultValue - Fallback value
 * @returns {number}
 */
const parseIntWithDefault = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

// Server configuration
const NODE_ENV = getEnv("NODE_ENV", "development").toLowerCase();
const PORT = parseIntWithDefault(getEnv("PORT"), 5000);
const CLIENT_URL = getEnv("CLIENT_URL", "http://localhost:3000");
const TRUST_PROXY = parseBoolean(getEnv("TRUST_PROXY"), false);

// Database configuration
const DATABASE_URL = getRequiredEnv("DATABASE_URL");

// JWT configuration
// JWT_ACCESS_SECRET supports JWT_SECRET fallback for legacy migrations.
const JWT_ACCESS_SECRET = getEnv("JWT_ACCESS_SECRET") || getRequiredEnv("JWT_SECRET");
const JWT_REFRESH_SECRET = getRequiredEnv("JWT_REFRESH_SECRET");

// Token expiry configuration (in seconds)
const ACCESS_TOKEN_EXPIRY_SECONDS = parseIntWithDefault(
  getEnv("ACCESS_TOKEN_EXPIRY_SECONDS"),
  15 * 60 // 15 minutes
);
const REFRESH_TOKEN_EXPIRY_SECONDS = parseIntWithDefault(
  getEnv("REFRESH_TOKEN_EXPIRY_SECONDS"),
  7 * 24 * 60 * 60 // 7 days
);

// Email configuration
const EMAIL_USER = getEnv("EMAIL_USER");
const EMAIL_PASS = getEnv("EMAIL_PASS");
const FROM_EMAIL = getEnv("FROM_EMAIL", EMAIL_USER);
const FROM_NAME = getEnv("FROM_NAME", "JAIWA Team");

/**
 * Application environment configuration object.
 */
const env = {
  NODE_ENV,
  PORT,
  CLIENT_URL,
  TRUST_PROXY,
  DATABASE_URL,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
  EMAIL_USER,
  EMAIL_PASS,
  FROM_EMAIL,
  FROM_NAME,

  /**
   * Checks if the application is running in production.
   * @returns {boolean}
   */
  get isProduction() {
    return this.NODE_ENV === "production";
  },

  /**
   * Checks if the application is running in development.
   * @returns {boolean}
   */
  get isDevelopment() {
    return this.NODE_ENV === "development";
  },

  /**
   * Checks if the application is running in test mode.
   * @returns {boolean}
   */
  get isTest() {
    return this.NODE_ENV === "test";
  },

  /**
   * Checks if email service is configured.
   * @returns {boolean}
   */
  get isEmailConfigured() {
    return Boolean(this.EMAIL_USER && this.EMAIL_PASS);
  },
};

module.exports = env;
