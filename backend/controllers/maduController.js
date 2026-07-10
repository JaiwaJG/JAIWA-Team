/**
 * Madu (Admin) Controller
 *
 * Handles administrator dashboard operations.
 * All endpoints require MADU or ADMIN role.
 */

const userService = require("../services/userService");
const HTTP_STATUS = require("../constants/httpStatus");
const ERROR_CODES = require("../constants/errorCodes");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET /api/madu/dashboard
 */
const dashboard = asyncHandler(async (req, res) => {
  const [totalUsers, verifiedUsers] = await Promise.all([
    userService.countUsers(),
    userService.countVerifiedUsers(),
  ]);

  res.status(HTTP_STATUS.OK).json(
    successResponse("Dashboard data fetched successfully", {
      dashboard: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
      },
    })
  );
});

/**
 * GET /api/madu/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );
  const search = req.query.search || "";

  const result = await userService.listUsers({ page, limit, search });

  res.status(HTTP_STATUS.OK).json(
    successResponse("Users fetched successfully", result)
  );
});

/**
 * PATCH /api/madu/users/:id/role
 */
const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const allowedRoles = ["USER", "MADU", "ADMIN"];

  if (!allowedRoles.includes(role)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid role")
    );
  }

  const user = await userService.updateUser(id, { role });

  res.status(HTTP_STATUS.OK).json(
    successResponse("User role updated successfully", {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.toLowerCase(),
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  );
});

/**
 * DELETE /api/madu/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.userId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "You cannot delete your own account"
      )
    );
  }

  const targetUser = await userService.findUserById(id);

  if (!targetUser) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      errorResponse(ERROR_CODES.USER_NOT_FOUND, "User not found")
    );
  }

  if (targetUser.role === "ADMIN") {
    const adminCount = await userService.countUsersByRole("ADMIN");

    if (adminCount <= 1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          "Cannot delete the last admin account"
        )
      );
    }
  }

  await userService.deleteUser(id);

  res.status(HTTP_STATUS.OK).json(
    successResponse("User deleted successfully")
  );
});

module.exports = {
  dashboard,
  getUsers,
  updateRole,
  deleteUser,
};
