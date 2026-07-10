const journeyService = require("../services/journeyService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/responseHelper");
const HTTP_STATUS = require("../constants/httpStatus");

// GET /api/madu/journey
exports.getJourney = asyncHandler(async (req, res) => {

    const journey = await journeyService.getAll();

    res.status(HTTP_STATUS.OK).json(
        successResponse("Journey fetched successfully", {
            journey
        })
    );

});

// POST /api/madu/journey
exports.createJourney = asyncHandler(async (req, res) => {

    const journey = await journeyService.create(req.body);

    res.status(HTTP_STATUS.CREATED).json(
        successResponse("Journey created successfully", {
            journey
        })
    );

});

// PATCH /api/madu/journey/:id
exports.updateJourney = asyncHandler(async (req, res) => {

    const journey = await journeyService.update(
        req.params.id,
        req.body
    );

    res.status(HTTP_STATUS.OK).json(
        successResponse("Journey updated successfully", {
            journey
        })
    );

});

// DELETE /api/madu/journey/:id
exports.deleteJourney = asyncHandler(async (req, res) => {

    await journeyService.remove(req.params.id);

    res.status(HTTP_STATUS.OK).json(
        successResponse("Journey deleted successfully")
    );

});
