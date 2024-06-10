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

  console.log(dishes);

  return dishes; 
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
                select: productFields['dishServiceFetchProductFields'] || productFields['full']
              }
            }
          }
        },
      },
    },
  }) as DishType | null;;


  // Перечисление всех числовых полей, над которыми будут совершаться вычисления
  const calcFields = Object.keys(productFields['dishServiceFetchProductFields']).filter(
    key => !['id', 'name', 'subname', 'categoryname', 'isDeleted', 'wasteWeightDesc', 'wasteWeightValue'].includes(key)
  );

  // Инициализация объекта для хранения суммарных значений
  let totals: any = {};
  calcFields.forEach(field => {
    totals[field] = 0;
  });
  let weight = 0;

  let productsTable = dish==null?[]:dish.measures.map(m => {
    // количество единицы измерения (сколько стаканов, сколько грамм и тд.)
    let measureCount = m.value;
    // название единицы измерения
    let measureName = m.measure.name;
    // описание единицы измерения
    let measureDesc = m.measure.desc;
    // коэффициент единицы измерения, нормирующий measurment в граммы
    let measureValue = m.measure.value;
    // продукт
    let product = m.measure.product;
    // Вес продукта в граммах
    product.weight = measureCount*measureValue*100;
    // коэффициент веса продукта с отходами
    let wasteWeightValue = product.wasteWeightValue;
    let wasteWeightDesc = product.wasteWeightDesc;
    // Вес продукта с учетом веса отходов
    let productWasteWeight = product.weight * wasteWeightValue;

    console.log(`${product.name}, ${measureCount} ${measureName} ${measureDesc} = ${product.weight.toFixed(2)} г. / ${productWasteWeight.toFixed(2)} г. (${wasteWeightDesc})`);
    
    // Подсчет суммарных значений для каждого числового поля
    calcFields.forEach(field => {
      if (product[field] !== undefined) {
        totals[field] += (product[field] * product.weight / 100);
      }
    });
    weight += product.weight;
  })
  console.log(`Общий вес блюда: ${weight}`);
  const totalsNormalized = calcFields.reduce((acc, field) => {
    acc[field] = (totals[field] * 100 / weight);
    return acc;
  }, {} as any);
  console.log(`Характеристики блюда на 100г. продукта:`, totalsNormalized);
  return dish;
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
