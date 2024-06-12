// src/services/dishService.ts
import { PrismaClient } from '@prisma/client';
import { productFields } from './productFields';

const prisma = new PrismaClient();

// Определение типов для вложенных объектов
type MeasureType = {
  value: number;
  measure: {
    name: string;
    desc: string;
    value: number;
    product: any; // Вы можете определить более точный тип для продукта, если необходимо
  };
};

type DishType = {
  id: number;
  name: string;
  description: string;
  measures: MeasureType[];
};

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

type MultipleDishDataByProductId = {
  dishes: DishDataByProductId[];
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

// Создание множества блюд с productId
export const createMultipleByProductId = async (dishesData: DishDataByProductId[]) => {
  console.log(dishesData);
  const dishCreationPromises = dishesData.map(async (dishData) => {
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
  });

  return Promise.all(dishCreationPromises);
};


const dishToTotalsProductsWeight = (dish: DishType, mode: string) => {
  // 1. Используемые ингридиенты
  let dishProducts = [];

  // 2. Суммарные значения 
  // Перечисление всех числовых полей, над которыми будут совершаться вычисления
  const calcFields = Object.keys(productFields[mode]).filter(
    key => !['id', 'name', 'subname', 'categoryname', 'isDeleted', 'wasteWeightDesc', 'wasteWeightValue', 'Measures'].includes(key)
  );
  let totals: any = {};
  calcFields.forEach(field => { totals[field] = 0; });

  // 3. Вес блюда
  let dishWeight = 0;

  for (let i = 0; i < dish.measures.length; i++) {

    // 1. Используемые ингридиенты
    let dishMeasure = dish.measures[i];
    let product = dishMeasure.measure.product;
    let dishProduct = {} as any;
    dishProduct.name = product.name; // Киви
    dishProduct.dishMeasureValue = dishMeasure.value; // 0,5
    dishProduct.dishMeasureName = dishMeasure.measure.name; // стаканов
    dishProduct.dishMeasureDesc = dishMeasure.measure.desc; // в измельченном виде
    dishProduct.dishWeight = (dishMeasure.value * dishMeasure.measure.value * 100); // 89,50 (грамм)
    dishProduct.dishWasteWeight = (dishProduct.dishWeight * product.wasteWeightValue); // 117.76 (грамм)
    dishProduct.dishWasteWeightDesc = product.wasteWeightDesc; // кожура, 24% от веса
    // console.log(dishProduct);
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
  }, {} as any);

  return {id: dish.id, name: dish.name, description: dish.description, weigth: dishWeight, products: dishProducts, totals: totalsNormalized};
}

export const fetchDishes = async (mode: string) => {
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

  // Преобразование каждого блюда с использованием dishToTotalsProductsWight
  let transformedDishes = dishes.map(dish => {
    const transformedDish = dishToTotalsProductsWeight(dish, mode);
    return transformedDish;
  })

  return transformedDishes;
};

export const fetchDishById = async (id: number, mode: string) => {
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
  }) as DishType | null;

  if (dish === null) {
    return {id: id, name: null, description: null, weigth: null, products: [], totals: null};
  } else {
    return dishToTotalsProductsWeight(dish, mode);
  }
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
