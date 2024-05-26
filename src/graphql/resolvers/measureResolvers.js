const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const measureResolvers = {
  Query: {
    measures: async () => await prisma.productMeasure.findMany(),
    measure: async (_, { id }) => await prisma.productMeasure.findUnique({ where: { id } }),
  },
  Mutation: {
    createMeasure: async (_, args) => {
      const newMeasure = await prisma.productMeasure.create({ data: args });
      return newMeasure;
    },
  },
};

module.exports = measureResolvers;
