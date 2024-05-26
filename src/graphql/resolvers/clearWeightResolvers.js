const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearWeightResolvers = {
  Query: {
    clearWeights: async () => await prisma.productClearWeight.findMany(),
    clearWeight: async (_, { id }) => await prisma.productClearWeight.findUnique({ where: { id } }),
  },
  Mutation: {
    createClearWeight: async (_, args) => {
      const newClearWeight = await prisma.productClearWeight.create({ data: args });
      return newClearWeight;
    },
  },
};

module.exports = clearWeightResolvers;
