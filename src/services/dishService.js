// src/services/dishService.js

const { PrismaClient } = require('@prisma/client');
const { productFields } = require('./productFields');

const prisma = new PrismaClient();

// Создание блюда с measureId
const createByMeasureId = async (dishData) => {
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
const createByProductId = async (dishData) => {
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

// Создание множества блюд с productId
const createMultipleByProductId = async (dishesData) => {
  const dishCreationPromises = dishesData.map(async (dishData) => {
    if (!Array.isArray(dishData.products)) {
      throw new Error("products must be an array");
    }

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
  });

  return Promise.all(dishCreationPromises);
};

const dishToTotalsProductsWeight = (dish, mode) => {
  // 1. Используемые ингридиенты
  let dishProducts = [];

  // 2. Суммарные значения 
  // Перечисление всех числовых полей, над которыми будут совершаться вычисления
  const calcFields = Object.keys(productFields[mode]).filter(
    key => !['id', 'name', 'subname', 'categoryname', 'isDeleted', 'wasteWeightDesc', 'wasteWeightValue', 'Measures'].includes(key)
  );
  let totals = {};
  calcFields.forEach(field => { totals[field] = 0; });

  // 3. Вес блюда
  let dishWeight = 0;

  for (let i = 0; i < dish.measures.length; i++) {
    // 1. Используемые ингридиенты
    let dishMeasure = dish.measures[i];
    let product = dishMeasure.measure.product;
    let dishProduct = {};
    dishProduct.name = product.name; // Киви
    dishProduct.dishMeasureValue = dishMeasure.value; // 0,5
    dishProduct.dishMeasureName = dishMeasure.measure.name; // стаканов
    dishProduct.dishMeasureDesc = dishMeasure.measure.desc; // в измельченном виде
    dishProduct.dishWeight = (dishMeasure.value * dishMeasure.measure.value * 100); // 89,50 (грамм)
    dishProduct.dishWasteWeight = (dishProduct.dishWeight * product.wasteWeightValue); // 117.76 (грамм)
    dishProduct.dishWasteWeightDesc = product.wasteWeightDesc; // кожура, 24% от веса
    dishProducts.push(dishProduct);

    // 2. Объект для хранения суммарных значений
    calcFields.forEach(field => {
      let fieldValue = product[field];
      if (fieldValue !== undefined) {
        dishProduct[field] = fieldValue;
        totals[field] += (fieldValue * dishProduct.dishWeight / 100);
      }
    });

    // 3 Вес блюда
    dishWeight += dishProduct.dishWeight;
  }

  // 2. Нормализация всех суммирующих макро и микронтриентов на 100г продукта
  const totalsNormalized = calcFields.reduce((acc, field) => {
    acc[field] = (totals[field] * 100 / dishWeight);
    return acc;
  }, {});

  return {id: dish.id, name: dish.name, description: dish.description, weight: dishWeight, products: dishProducts, totals: totalsNormalized};
}

const fetchDishes = async (mode) => {
  let dishes = await prisma.dish.findMany({
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

  // Преобразование каждого блюда с использованием dishToTotalsProductsWeight
  let transformedDishes = dishes.map(dish => {
    const transformedDish = dishToTotalsProductsWeight(dish, mode);
    return transformedDish;
  });

  return transformedDishes;
};

const fetchDishById = async (id, mode) => {
  let dish = await prisma.dish.findUnique({
    where: { id },
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

  if (dish === null) {
    return {id: id, name: null, description: null, weight: null, products: [], totals: null};
  } else {
    return dishToTotalsProductsWeight(dish, mode);
  }
};

const updateByMeasureId = async (id, dishData) => {
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

const updateByProductId = async (id, dishData) => {
  if (!Array.isArray(dishData.products)) {
    throw new Error("measures must be an array");
  }

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

const deleteDish = async (id) => {
  return prisma.dish.delete({
    where: { id },
  });
};

module.exports = {
  createByMeasureId,
  createByProductId,
  createMultipleByProductId,
  fetchDishes,
  fetchDishById,
  updateByMeasureId,
  updateByProductId,
  deleteDish,
};
