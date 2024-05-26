const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productResolvers = {
  Query: {
    products: async () => await prisma.product.findMany(),
    product: async (_, { id }) => await prisma.product.findUnique({ where: { id } }),
  },
  Mutation: {
    createProduct: async (_, args) => {
      const newProduct = await prisma.product.create({
        data: {
          name: args.name,
          subname: args.subname,
          productCategory: args.productCategory,
          kcal: args.kcal,
          protein: args.protein,
          fat: args.fat,
          carbohydrate: args.carbohydrate,
          fiber: args.fiber,
          sugar: args.sugar,
          ash: args.ash,
          starch: args.starch,
          calcium: args.calcium,
          iron: args.iron,
          magnesium: args.magnesium,
          phosphorus: args.phosphorus,
          potassium: args.potassium,
          sodium: args.sodium,
          zinc: args.zinc,
          copper: args.copper,
          manganese: args.manganese,
          selenium: args.selenium,
          vitamin_a: args.vitamin_a,
          vitamin_b3: args.vitamin_b3,
          vitamin_b4: args.vitamin_b4,
          vitamin_b5: args.vitamin_b5,
          vitamin_b6: args.vitamin_b6,
          vitamin_b9: args.vitamin_b9,
          vitamin_c: args.vitamin_c,
          vitamin_e: args.vitamin_e,
          vitamin_k: args.vitamin_k,
          alpha_carotene: args.alpha_carotene,
          beta_carotene: args.beta_carotene,
          chole: args.chole,
          trans: args.trans,
          water: args.water,
        },
      });
      return newProduct;
    },
  },
  Product: {
    clearWeights: async (parent) => await prisma.productClearWeight.findMany({ where: { productId: parent.id } }),
    measures: async (parent) => await prisma.productMeasure.findMany({ where: { productId: parent.id } }),
  }
};

module.exports = productResolvers;
