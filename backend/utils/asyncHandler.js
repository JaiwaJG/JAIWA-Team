/**
 * Async Error Wrapper
 *
 * Eliminates repetitive try/catch blocks in Express route handlers.
 * Catches errors from async functions and forwards them to the centralized error handler.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async Express route handler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
