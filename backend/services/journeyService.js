require("../config/env");
const prisma = require("../config/database");

exports.getAll = () => {
    return prisma.journey.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
};

exports.create = (data) => {
    return prisma.journey.create({
        data
    });
};

exports.update = (id, data) => {
    return prisma.journey.update({
        where: { id },
        data
    });
};

exports.remove = (id) => {
    return prisma.journey.delete({
        where: { id }
    });
};
