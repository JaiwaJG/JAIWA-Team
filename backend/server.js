/**
 * JAIWA Team Backend Server
 *
 * Entry point for the Express application.
 * Loads configuration, creates the app, mounts routes, registers error handlers,
 * and starts the HTTP server.
 */

const env = require("./config/env");
const { createApp } = require("./config/appConfig");
const notFoundHandler = require("./middleware/error/notFoundHandler");
const centralErrorHandler = require("./middleware/error/centralErrorHandler");
const { successResponse } = require("./utils/responseHelper");
const logger = require("./utils/logger");
const MESSAGES = require("./constants/messages");

// Madu Rung
const serviceRoutes = require("./routes/serviceRoutes");
const journeyRoutes = require("./routes/journeyRoutes");
const bookRoutes = require("./routes/bookRoutes");
const maduServiceRoutes = require("./routes/maduServiceRoutes");
const maduJourneyRoutes = require("./routes/maduJourneyRoutes");
const maduBookRoutes = require("./routes/maduBookRoutes");

// Import existing route modules
const authRoutes = require("./routes/authRoutes");
const maduRoutes = require("./routes/maduRoutes");

//Creates the Express application with all security middleware applied.

const app = createApp();

//API Routes

app.use("/api/auth", authRoutes);

app.use("/api", serviceRoutes);
app.use("/api", journeyRoutes);
app.use("/api", bookRoutes);

app.use("/api/madu", maduRoutes);
app.use("/api/madu", maduServiceRoutes);
app.use("/api/madu", maduJourneyRoutes);
app.use("/api/madu", maduBookRoutes);


//Root health check endpoint.
//Useful for load balancers and uptime monitors.

app.get("/", (req, res) => {
  res.json(successResponse(MESSAGES.SERVER_RUNNING));
});

/**
 * 404 Not Found handler for undefined routes.
 * Must be registered after all valid routes.
 */
app.use(notFoundHandler);

/**
 * Centralized error handler.
 * Catches all errors and returns consistent API error responses.
 * Must be registered last.
 */
app.use(centralErrorHandler);

/**
 * Starts the HTTP server (only in non-test environments).
 * In test mode, the app is exported without binding to a port.
 */
let server = null;

if (env.NODE_ENV !== "test") {
  server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`, {
      environment: env.NODE_ENV,
      port: env.PORT,
    });
  });

  /**
   * Graceful shutdown handling.
   * Closes the server on SIGTERM/SIGINT signals.
   */
  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

module.exports = { app, server };



