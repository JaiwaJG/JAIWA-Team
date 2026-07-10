const bookService = require("../services/bookService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/responseHelper");
const HTTP_STATUS = require("../constants/httpStatus");

// GET /api/books
exports.getBooks = asyncHandler(async (req, res) => {
    const books = await bookService.getAll();

    res.status(HTTP_STATUS.OK).json(
        successResponse("Books fetched successfully", {
            books
        })
    );
});

// GET /api/madu/books
exports.getMaduBooks = asyncHandler(async (req, res) => {
    const books = await bookService.getAll();

    res.status(HTTP_STATUS.OK).json(
        successResponse("Books fetched successfully", {
            books
        })
    );
});

// POST /api/madu/books
exports.createBook = asyncHandler(async (req, res) => {
    const book = await bookService.create(req.body);

    res.status(HTTP_STATUS.CREATED).json(
        successResponse("Book created successfully", {
            book
        })
    );
});

// PATCH /api/madu/books/:id
exports.updateBook = asyncHandler(async (req, res) => {
    const book = await bookService.update(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
        successResponse("Book updated successfully", {
            book
        })
    );
});

// DELETE /api/madu/books/:id
exports.deleteBook = asyncHandler(async (req, res) => {
    await bookService.remove(req.params.id);

    res.status(HTTP_STATUS.OK).json(
        successResponse("Book deleted successfully")
    );
});
