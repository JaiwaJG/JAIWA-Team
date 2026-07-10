/**
 * Jest Configuration
 *
 * Configures Jest for integration testing the Express API.
 */

module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  verbose: true,
  forceExit: true,
};
