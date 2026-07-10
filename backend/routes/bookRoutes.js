const express = require("express");
const router = express.Router();

const bookController = require("../controllers/bookController");
const authenticate = require("../middleware/auth/authenticate");

router.use(authenticate);

// USER Read Only
router.get("/books", bookController.getBooks);

module.exports = router;
