/**
 * Secure Human-Friendly Code Generator
 *
 * Generates cryptographically secure random 8-character codes.
 *
 * Alphabet excludes ambiguous characters:
 *   O, 0, I, 1, L
 *
 * Allowed characters:
 *   A-Z except O, I, L
 *   0-9 except 0, 1
 *
 * Used for:
 *   - Email verification codes
 *   - Password reset codes
 *
 * OWASP Top 10 relevance:
 *   A07:2021 – Identification and Authentication Failures
 */

const crypto = require("crypto");

/**
 * Human-friendly alphabet excluding ambiguous characters.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Default code length.
 */
const DEFAULT_CODE_LENGTH = 8;

/**
 * Generates a cryptographically secure random code.
 *
 * Uses rejection sampling to ensure uniform distribution across the alphabet.
 *
 * @param {number} [length=8] - Length of the code
 * @returns {string} Random code
 */
const generateCode = (length = DEFAULT_CODE_LENGTH) => {
  const alphabetLength = ALPHABET.length;
  let code = "";

  while (code.length < length) {
    const randomByte = crypto.randomBytes(1)[0];
    if (randomByte < alphabetLength * Math.floor(256 / alphabetLength)) {
      code += ALPHABET[randomByte % alphabetLength];
    }
  }

  return code;
};

/**
 * Hashes a plaintext code using SHA-256.
 *
 * @param {string} code - Plaintext code
 * @returns {string} SHA-256 hash
 */
const hashCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

module.exports = {
  generateCode,
  hashCode,
  ALPHABET,
};
