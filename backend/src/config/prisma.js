const { PrismaClient } = require("@prisma/client");

// Un seul client Prisma partagé dans toute l'app (bonne pratique Node/Express)
const prisma = new PrismaClient();

module.exports = prisma;
