const express = require("express");
const router = express.Router();

const journeyController = require("../controllers/journeyController");

const authenticate = require("../middleware/auth/authenticate");
const authorizeRole = require("../middleware/auth/authorizeRole");

router.use(authenticate);
router.use(authorizeRole("MADU", "ADMIN"));

// MADU CRUD
router.get("/journey", journeyController.getJourney);
router.post("/journey", journeyController.createJourney);
router.patch("/journey/:id", journeyController.updateJourney);
router.delete("/journey/:id", journeyController.deleteJourney);

module.exports = router;
