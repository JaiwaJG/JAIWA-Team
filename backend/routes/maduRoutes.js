/**
 * Madu (Admin) Routes
 *
 * Defines administrator dashboard API endpoints.
 * All routes require MADU or ADMIN role.
 */

const express = require("express");
const router = express.Router();

const maduController = require("../controllers/maduController");
const authenticate = require("../middleware/auth/authenticate");
const authorizeRole = require("../middleware/auth/authorizeRole");

router.use(authenticate, authorizeRole("MADU", "ADMIN"));

router.get("/dashboard", maduController.dashboard);
router.get("/users", maduController.getUsers);
router.patch("/users/:id/role", maduController.updateRole);
router.delete("/users/:id", maduController.deleteUser);

module.exports = router;
