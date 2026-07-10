/**
 * Express Application Configuration
 *
 * Creates and configures the Express application with all global security,
 * parsing, logging, and compression middleware.
 *
 * This module intentionally does NOT mount business routes or start the server.
 * Route mounting and server startup are handled by server.js.
 *
 * OWASP Top 10 relevance:
 *   A03:2021 – Injection
 *   A05:2021 – Security Misconfiguration
 *   A06:2021 – Vulnerable and Outdated Components (input size limits)
 *   A07:2021 – Identification and Authentication Failures (rate limiting)
 */

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");

const env = require("./env");
const { helmetOptions, corsOptions } = require("./securityConfig");
const requestIdMiddleware = require("../middleware/requestId");
const xssSanitizerMiddleware = require("../middleware/security/xssSanitizer");
const { standardLimiter } = require("../middleware/security/rateLimiter");
const logger = require("../utils/logger");

/**
 * Morgan stream that writes HTTP request logs through the application logger.
 */
const morganStream = {
  write: (message) => {
    logger.info(message.trim(), { source: "http" });
  },
};

/**
 * Creates and configures an Express application instance.
 *
 * @returns {object} Configured Express application
 */
const createApp = () => {
  const app = express();

  // Trust proxy when running behind a reverse proxy (e.g., Nginx, Cloudflare)
  if (env.TRUST_PROXY) {
    app.set("trust proxy", true);
  }

  // Disable the X-Powered-By header to reduce information disclosure
  app.disable("x-powered-by");

  // Assign a unique request ID to every request for tracing
  app.use(requestIdMiddleware);

  // HTTP request logging
  // In production, use the combined format; in development, use dev format
  const morganFormat = env.isProduction ? "combined" : "dev";
  app.use(morgan(morganFormat, { stream: morganStream }));

  // Security headers via Helmet
  app.use(helmet(helmetOptions));

  // CORS configuration
  app.use(cors(corsOptions));

  // Enable response compression
  app.use(compression());

  // Parse JSON request bodies with a size limit to prevent DoS
  app.use(express.json({ limit: "10kb" }));

  // Parse URL-encoded request bodies with a size limit
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Parse cookies
  app.use(cookieParser());

  // HTTP Parameter Pollution protection
  // Prevents attackers from passing duplicate query parameters to bypass validation
  app.use(hpp());

  // XSS input sanitization for body, query, and params
  app.use(xssSanitizerMiddleware);

  // Apply standard rate limiting to all routes
  app.use(standardLimiter);

  return app;
};

module.exports = { createApp };
