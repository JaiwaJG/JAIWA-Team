/**
 * User Service
 *
 * Handles user-related database operations.
 * Keeps controllers thin by centralizing Prisma queries.
 */

const prisma = require("../config/database");

/**
 * Creates a new user.
 *
 * @param {object} data - User creation data
 * @returns {Promise<object>} Created user
 */
const createUser = (data) => {
  return prisma.user.create({ data });
};

/**
 * Finds a user by email address.
 *
 * @param {string} email - Email address
 * @returns {Promise<object|null>} User record or null
 */
const findUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

/**
 * Finds a user by username.
 *
 * @param {string} username - Username
 * @returns {Promise<object|null>} User record or null
 */
const findUserByUsername = (username) => {
  return prisma.user.findUnique({ where: { username } });
};

/**
 * Finds a user by ID.
 *
 * @param {string} id - User ID
 * @returns {Promise<object|null>} User record or null
 */
const findUserById = (id) => {
  return prisma.user.findUnique({ where: { id } });
};

/**
 * Updates a user by ID.
 *
 * @param {string} id - User ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated user
 */
const updateUser = (id, data) => {
  return prisma.user.update({ where: { id }, data });
};

/**
 * Deletes a user by ID.
 *
 * @param {string} id - User ID
 * @returns {Promise<object>} Deleted user
 */
const deleteUser = (id) => {
  return prisma.user.delete({ where: { id } });
};

/**
 * Counts total users.
 *
 * @returns {Promise<number>} Total user count
 */
const countUsers = () => {
  return prisma.user.count();
};

/**
 * Counts verified users.
 *
 * @returns {Promise<number>} Verified user count
 */
const countVerifiedUsers = () => {
  return prisma.user.count({ where: { isVerified: true } });
};

/**
 * Counts users by role.
 *
 * @param {string} role - Role enum value
 * @returns {Promise<number>} User count for the role
 */
const countUsersByRole = (role) => {
  return prisma.user.count({ where: { role } });
};

/**
 * Lists users with pagination and optional search.
 *
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} [params.search] - Search term
 * @returns {Promise<object>} Paginated users and metadata
 */
const listUsers = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  updateUser,
  deleteUser,
  countUsers,
  countVerifiedUsers,
  countUsersByRole,
  listUsers,
};
