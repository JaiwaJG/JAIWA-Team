const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");

const authenticate = require("../middleware/auth/authenticate");
const authorizeRole = require("../middleware/auth/authorizeRole");

router.use(authenticate);
router.use(authorizeRole("MADU", "ADMIN"));

// MADU CRUD
router.get("/services", serviceController.getServices);
router.post("/services", serviceController.createService);
router.patch("/services/:id", serviceController.updateService);
router.delete("/services/:id", serviceController.deleteService);

module.exports = router;