require("../config/env");
const prisma = require("../config/database");

exports.getAll = () => {
    return prisma.book.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
};

exports.create = (data) => {
    return prisma.book.create({
        data
    });
};

exports.update = (id, data) => {
    return prisma.book.update({
        where: { id },
        data
    });
};

exports.remove = (id) => {
    return prisma.book.delete({
        where: { id }
    });
};
