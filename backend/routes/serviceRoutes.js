const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");
const authenticate = require("../middleware/auth/authenticate");

router.use(authenticate);

// USER Read Only
router.get("/services", serviceController.getServices);

module.exports = router;