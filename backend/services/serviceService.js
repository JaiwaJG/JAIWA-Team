const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAll = () => {
    return prisma.service.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
};

exports.create = (data) => {
    return prisma.service.create({
        data: {
            ...data,
            expire: new Date(data.expire)
        }
    });
};

exports.update = (id, data) => {
    return prisma.service.update({
        where: { id },
        data: {
            ...data,
            expire: new Date(data.expire)
        }
    });
};

exports.remove = (id) => {
    return prisma.service.delete({
        where: { id }
    });
};