const express = require("express");
const router = express.Router();

const bookController = require("../controllers/bookController");

const authenticate = require("../middleware/auth/authenticate");
const authorizeRole = require("../middleware/auth/authorizeRole");

router.use(authenticate);
router.use(authorizeRole("MADU", "ADMIN"));

// MADU CRUD
router.get("/books", bookController.getMaduBooks);
router.post("/books", bookController.createBook);
router.patch("/books/:id", bookController.updateBook);
router.delete("/books/:id", bookController.deleteBook);

module.exports = router;
