const serviceService = require("../services/serviceService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/responseHelper");
const HTTP_STATUS = require("../constants/httpStatus");

// GET /api/madu/services
exports.getServices = asyncHandler(async (req, res) => {

    const services = await serviceService.getAll();

    res.status(HTTP_STATUS.OK).json(
        successResponse("Services fetched successfully", {
            services
        })
    );

});

// POST /api/madu/services
exports.createService = asyncHandler(async (req, res) => {

    const service = await serviceService.create(req.body);

    res.status(HTTP_STATUS.CREATED).json(
        successResponse("Service created successfully", {
            service
        })
    );

});

// PATCH /api/madu/services/:id
exports.updateService = asyncHandler(async (req, res) => {

    const service = await serviceService.update(
        req.params.id,
        req.body
    );

    res.status(HTTP_STATUS.OK).json(
        successResponse("Service updated successfully", {
            service
        })
    );

});

// DELETE /api/madu/services/:id
exports.deleteService = asyncHandler(async (req, res) => {

    await serviceService.remove(req.params.id);

    res.status(HTTP_STATUS.OK).json(
        successResponse("Service deleted successfully")
    );

});