/**
 * Token Service
 *
 * Manages JWT access tokens and secure refresh token rotation.
 *
 * Security features:
 *   - Short-lived access tokens (15 minutes by default)
 *   - Refresh tokens stored as SHA-256 hashes in the database
 *   - Token rotation: old refresh tokens are revoked when used
 *   - Token revocation: logout revokes the specific token
 *   - Logout from all devices: revoke all tokens for a user
 *
 * OWASP Top 10 relevance:
 *   A07:2021 – Identification and Authentication Failures
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/database");
const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Generates a JWT access token for a user.
 *
 * @param {object} payload - User payload to encode
 * @param {string} payload.userId - User ID
 * @param {string} payload.role - User role
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY_SECONDS,
  });
};

/**
 * Verifies a JWT access token.
 *
 * @param {string} token - JWT access token
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Generates a cryptographically secure refresh token.
 *
 * @returns {string} Refresh token (plaintext, returned once to client)
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Hashes a token using SHA-256 for secure database storage.
 *
 * @param {string} token - Plaintext token
 * @returns {string} SHA-256 hash
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Creates and stores a new refresh token for a user.
 *
 * @param {string} userId - User ID
 * @param {string} token - Plaintext refresh token
 * @param {Date} expiresAt - Expiration date
 * @param {string} [ipAddress] - Client IP address
 * @param {string} [userAgent] - Client user agent
 * @returns {Promise<object>} Stored refresh token record
 */
const createRefreshToken = async (
  userId,
  token,
  expiresAt,
  ipAddress = null,
  userAgent = null
) => {
  const tokenHash = hashToken(token);

  return prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });
};

/**
 * Finds a refresh token by its hash.
 *
 * @param {string} tokenHash - SHA-256 hash of the refresh token
 * @returns {Promise<object|null>} Refresh token record or null
 */
const findRefreshTokenByHash = (tokenHash) => {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
};

/**
 * Revokes a refresh token by ID.
 *
 * @param {string} id - Refresh token ID
 * @returns {Promise<object>} Updated refresh token record
 */
const revokeRefreshToken = (id) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
};

/**
 * Revokes all refresh tokens for a user.
 *
 * @param {string} userId - User ID
 * @returns {Promise<object>} Prisma batch update result
 */
const revokeAllUserRefreshTokens = (userId) => {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

/**
 * Generates a cryptographically secure random token for email verification
 * or password reset flows.
 *
 * @returns {string} Random hex token
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Rotates a refresh token.
 * Revokes the old token and creates a new one.
 *
 * @param {object} oldToken - Existing refresh token record
 * @param {string} newTokenPlain - New plaintext refresh token
 * @param {Date} newExpiresAt - New expiration date
 * @param {string} [ipAddress] - Client IP address
 * @param {string} [userAgent] - Client user agent
 * @returns {Promise<object>} New refresh token record
 */
const rotateRefreshToken = async (
  oldToken,
  newTokenPlain,
  newExpiresAt,
  ipAddress = null,
  userAgent = null
) => {
  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: oldToken.id },
      data: { revokedAt: new Date() },
    });

    return tx.refreshToken.create({
      data: {
        tokenHash: hashToken(newTokenPlain),
        userId: oldToken.userId,
        expiresAt: newExpiresAt,
        ipAddress,
        userAgent,
      },
    });
  });
};

/**
 * Validates a plaintext refresh token.
 * Returns the associated token record if valid, otherwise null.
 *
 * @param {string} token - Plaintext refresh token
 * @returns {Promise<object|null>} Refresh token record with user or null
 */
const validateRefreshToken = async (token) => {
  const tokenHash = hashToken(token);
  const record = await findRefreshTokenByHash(tokenHash);

  if (!record) {
    return null;
  }

  if (record.revokedAt) {
    logger.warn("Attempted use of revoked refresh token", {
      userId: record.userId,
      tokenId: record.id,
    });
    return null;
  }

  if (record.expiresAt < new Date()) {
    return null;
  }

  return record;
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  generateSecureToken,
  rotateRefreshToken,
  validateRefreshToken,
};
