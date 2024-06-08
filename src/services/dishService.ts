import { PrismaClient } from '@prisma/client';
import { productFields } from './productFields';

const prisma = new PrismaClient();

type DishMeasureInputByMeasureId = {
  measureId: number;
  value: number;
};

type DishMeasureInputByProductId = {
  productId: number;
  value: number;
};

type DishDataByMeasureId = {
  name: string;
  description: string;
  measures: DishMeasureInputByMeasureId[];
};

type DishDataByProductId = {
  name: string;
  description: string;
  products: DishMeasureInputByProductId[];
};

// Создание блюда с measureId
export const createByMeasureId = async (dishData: DishDataByMeasureId) => {
  if (!Array.isArray(dishData.measures)) {
    throw new Error("measures must be an array");
  }

  return prisma.dish.create({
    data: {
      name: dishData.name,
      description: dishData.description,
      measures: {
        create: dishData.measures.map(measure => ({
          measure: { connect: { id: measure.measureId } },
          value: measure.value,
        })),
      },
    },
  });
};

// Создание блюда с productId
export const createByProductId = async (dishData: DishDataByProductId) => {
  if (!Array.isArray(dishData.products)) {
    throw new Error("products must be an array");
  }

  // Получение measureId для каждого продукта, где name == "грамм"
  const measuresWithGram = await Promise.all(dishData.products.map(async (product) => {
    const gramMeasure = await prisma.measure.findFirst({
      where: {
        productId: product.productId,
        name: 'грамм'
      }
    });

    if (!gramMeasure) {
      throw new Error(`Measure with name 'грамм' not found for productId ${product.productId}`);
    }

    return {
      measureId: gramMeasure.id,
      value: product.value
    };
  }));

  return prisma.dish.create({
    data: {
      name: dishData.name,
      description: dishData.description,
      measures: {
        create: measuresWithGram.map(measure => ({
          measure: { connect: { id: measure.measureId } },
          value: measure.value,
        })),
      },
    },
  });
};

export const fetchDishes = async (mode: string) => {
  return prisma.dish.findMany({
    include: {
      measures: {
        include: {
          measure: {
            include: {
              product: {
                select: productFields[mode] || productFields['full']
              }
            }
          }
        },
      },
    },
  });
};

export const fetchDishById = async (id: number) => {
  return prisma.dish.findUnique({
    where: { id },
    include: {
      measures: {
        include: {
          measure: true,
        },
      },
    },
  });
};

export const updateByMeasureId = async (id: number, dishData: DishDataByMeasureId) => {
  if (!Array.isArray(dishData.measures)) {
    throw new Error("measures must be an array");
  }

  return prisma.dish.update({
    where: { id },
    data: {
      name: dishData.name,
      description: dishData.description,
      measures: {
        deleteMany: {},
        create: dishData.measures.map(measure => ({
          measure: { connect: { id: measure.measureId } },
          value: measure.value,
        })),
      },
    },
  });
};

export const updateByProductId = async (id: number, dishData: DishDataByProductId) => {
  if (!Array.isArray(dishData.products)) {
    throw new Error("measures must be an array");
  }

  // Получение measureId для каждого продукта, где name == "грамм"
  const measuresWithGram = await Promise.all(dishData.products.map(async (product) => {
    const gramMeasure = await prisma.measure.findFirst({
      where: {
        productId: product.productId,
        name: 'грамм'
      }
    });

    if (!gramMeasure) {
      throw new Error(`Measure with name 'грамм' not found for productId ${product.productId}`);
    }

    return {
      measureId: gramMeasure.id,
      value: product.value
    };
  }));

  return prisma.dish.update({
    where: { id },
    data: {
      name: dishData.name,
      description: dishData.description,
      measures: {
        deleteMany: {},
        create: measuresWithGram.map(measure => ({
          measure: { connect: { id: measure.measureId } },
          value: measure.value,
        })),
      },
    },
  });
};

export const deleteDish = async (id: number) => {
  return prisma.dish.delete({
    where: { id },
  });
};
