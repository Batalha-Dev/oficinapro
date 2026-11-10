const { PrismaClient } = require('@prisma/client');

// Uma única instância por processo evita esgotar conexões no dev (nodemon).
const prisma = new PrismaClient();

module.exports = prisma;
