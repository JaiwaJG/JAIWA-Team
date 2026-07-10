/**
 * Security Configuration
 *
 * Centralizes Helmet, CORS, and other security-related settings.
 * All values are driven by environment variables where appropriate.
 *
 * OWASP Top 10 relevance:
 *   A05:2021 – Security Misconfiguration
 *   A07:2021 – Identification and Authentication Failures
 */

const env = require("./env");

/**
 * Helmet configuration.
 *
 * Helmet sets security-related HTTP response headers.
 * Some policies are relaxed in development for frontend tooling compatibility,
 * but tightened in production.
 */
const helmetOptions = {
  // Disable the default Content-Security-Policy to avoid breaking frontend assets
  // In production, define a strict CSP policy tailored to your frontend.
  contentSecurityPolicy: false,

  // Cross-Origin-Resource-Policy header
  // Set to "cross-origin" only if your API serves resources used cross-origin.
  crossOriginResourcePolicy: { policy: "cross-origin" },

  // Prevents DNS prefetching to reduce information leakage
  dnsPrefetchControl: { allow: false },

  // Enforces HTTPS for supported browsers
  hsts: env.isProduction
    ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      }
    : false,

  // Prevents clickjacking by denying framing
  frameguard: { action: "deny" },

  // Restricts referrer information
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // Stops MIME-type sniffing
  noSniff: true,

  // Enables XSS filter in legacy browsers
  xssFilter: true,

  // Hides the X-Powered-By header (also disabled separately in appConfig)
  hidePoweredBy: true,
};

/**
 * CORS configuration.
 *
 * Restricts which origins can access the API.
 * In production, only the configured CLIENT_URL should be allowed.
 */
const corsOptions = {
  // Allow the configured frontend origin
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins for convenience
    if (env.isDevelopment) {
      return callback(null, true);
    }

    // In production, only allow the configured client URL
    const allowedOrigins = [env.CLIENT_URL].filter(Boolean);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  // Allow cookies and authorization headers to be sent cross-origin
  credentials: true,

  // Allowed HTTP methods
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  // Allowed headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Request-ID",
  ],

  // Exposed headers so the frontend can read them
  exposedHeaders: ["X-Request-ID"],

  // Cache preflight requests for 24 hours
  maxAge: 86400,
};

/**
 * Cookie security options.
 * Used when setting authentication cookies.
 */
const cookieOptions = {
  httpOnly: true, // Prevent JavaScript access
  secure: env.isProduction, // Only send over HTTPS in production
  sameSite: env.isProduction ? "strict" : "lax", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = {
  helmetOptions,
  corsOptions,
  cookieOptions,
};
