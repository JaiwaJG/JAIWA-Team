/**
 * Password Service
 *
 * Handles password hashing and verification using bcrypt.
 * Centralizes password-related operations to avoid duplicated logic.
 *
 * OWASP Top 10 relevance:
 *   A07:2021 – Identification and Authentication Failures
 */

const bcrypt = require("bcrypt");

/**
 * Number of salt rounds for bcrypt hashing.
 * 12 rounds provides a strong balance between security and performance.
 */
const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password.
 *
 * @param {string} password - Plain-text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password with a stored hash.
 *
 * @param {string} password - Plain-text password
 * @param {string} hash - Stored password hash
 * @returns {Promise<boolean>} True if the password matches
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
