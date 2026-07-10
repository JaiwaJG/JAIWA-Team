const express = require("express");
const router = express.Router();

const journeyController = require("../controllers/journeyController");
const authenticate = require("../middleware/auth/authenticate");

router.use(authenticate);

// USER Read Only
router.get("/journey", journeyController.getJourney);

module.exports = router;
