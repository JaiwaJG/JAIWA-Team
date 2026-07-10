/**
 * Prisma Database Client
 *
 * Provides a singleton PrismaClient instance to prevent multiple
 * client instances from being created during development hot-reloads.
 *
 * In production, the same instance is reused across the application.
 */

require("../config/env");
const { PrismaClient } = require("@prisma/client");

/**
 * Global Prisma client instance.
 * Attaching to globalThis prevents connection pool exhaustion during hot reloads.
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
