/**
 * Secure one-time code generator.
 *
 * Generates cryptographically secure random codes using an alphabet that
 * excludes visually ambiguous characters (O, 0, I, 1, L).
 */

const crypto = require("crypto");

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generates a secure random OTP.
 *
 * @param {number} [length=8] - Code length
 * @returns {string} Random OTP
 */
const generateOTP = (length = 8) => {
  const maxByte = 256 - (256 % ALPHABET.length);
  let otp = "";

  while (otp.length < length) {
    const byte = crypto.randomBytes(1)[0];
    if (byte < maxByte) {
      otp += ALPHABET[byte % ALPHABET.length];
    }
  }

  return otp;
};

module.exports = { generateOTP };
