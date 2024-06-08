// src/services/productService.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { productFields } from './productFields';

const prisma = new PrismaClient();

type Measure = {
  name: string;
  value: number;
  desc: string;
};

type ProductData = {
  productCategory: string;
  name: string;
  subname?: string;
  kcal: number;
  mainFats: number;
  mainProteins: number;
  mainCarb: number;
  mainWater: number;
  mainAsh: number;
  subSugar?: number;
  subFiber?: number;
  subStarch?: number;
  subTransfats?: number;
  vitamin_a?: number;
  beta_carotene?: number;
  alpha_carotene?: number;
  vitamin_e?: number;
  vitamin_k?: number;
  vitamin_c?: number;
  vitamin_b1?: number;
  vitamin_b3?: number;
  vitamin_b4?: number;
  vitamin_b5?: number;
  vitamin_b6?: number;
  vitamin_b9?: number;
  vitamin_b12?: number;
  vitamin_b2?: number;
  vitamin_d?: number;
  vitamin_d2?: number;
  vitamin_d3?: number;
  calcium?: number;
  fluoride?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  sodium?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  wasteWeightValue: number;
  wasteWeightDesc: string;
  isDeleted?: boolean;
  Measures: Measure[];
};

// Создание продукта
export const createNewProduct = async (productData: ProductData) => {
  // Проверка наличия массива PproductData.Measures
  if (!productData.Measures) {
    productData.Measures = [];
  }
  // Проверка наличия объекта с name == "грамм"
  const hasGramMeasure = productData.Measures.some((measure: Measure) => measure.name === 'грамм');
  // Если объекта нет, добавляем его
  if (!hasGramMeasure) {
    productData.Measures.push({
      name: 'грамм',
      value: 0.01,
      desc: ''
    });
  }

  return prisma.product.create({
    data: {
      ...productData,
      Measures: {
        create: productData.Measures,
      },
    },
  });
};

// Получение всех продуктов (все поля)
export const fetchProducts = async (mode: string) => {
  return prisma.product.findMany({
    select: productFields[mode] || productFields['full']
  });
};

// Получение категорий продуктов и количества продуктов, относящихся к категории
export const fetchProductCategories = async () => {
  const categories = await prisma.product.groupBy({
    by: ['productCategory'],
    _count: {
      productCategory: true,
    },
  });

  return categories.map(category => ({
    category: category.productCategory,
    count: category._count.productCategory,
  }));
};

// Получение продукта по id
export const fetchProductById = async (id: number, mode: string) => {
  return prisma.product.findUnique({
    where: { id },
    select: productFields[mode] || productFields['full']
  });
};


// Обновление продукта
export const updateProduct = async (id: number, productData: ProductData) => {
  const { Measures, ...productFields } = productData;

  // Если Measures не передали, значит обновляем без Measures
  if (!Measures) {
    return prisma.product.update({
      where: { id },
      data: {
        ...productFields
      },
    });
  }
  
  // Проверка наличия объекта с name == "грамм"
  const hasGramMeasure = productData.Measures.some((measure: Measure) => measure.name === 'грамм');
  // Если объекта нет, добавляем его
  if (!hasGramMeasure) {
    productData.Measures.push({
      name: 'грамм',
      value: 0.01,
      desc: ''
    });
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...productFields,
      Measures: productData.Measures ? {
        deleteMany: {},
        create: productData.Measures,
      } : undefined,
    },
  });
};

// Удаление продукта
export const deleteProduct = async (id: number) => {
  return prisma.product.delete({
    where: { id },
  });
};


// Поиск продуктов (только главные поля) по текстовым полям с приоритезацией 
export const searchProducts = async (searchString: string, mode: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  // Выполнение единственного запроса с объединением всех условий
  const results = await prisma.product.findMany({
    select: productFields[mode] || productFields['full'],
    where: {
      OR: [
        { name: { startsWith: lowerCaseSearchString } },
        { subname: { startsWith: lowerCaseSearchString } },
        { productCategory: { startsWith: lowerCaseSearchString } },
        { name: { contains: lowerCaseSearchString } },
        { subname: { contains: lowerCaseSearchString } },
        { productCategory: { contains: lowerCaseSearchString } },
      ],
    },
  });

  // Сортировка результатов по приоритету
  const sortedResults = results.sort((a, b) => {
    const getPriority = (product: any) => {
      if (typeof product.name === 'string' && product.name.toLowerCase().startsWith(lowerCaseSearchString)) return 1;
      if (typeof product.subname === 'string' && product.subname.toLowerCase().startsWith(lowerCaseSearchString)) return 2;
      if (typeof product.productCategory === 'string' && product.productCategory.toLowerCase().startsWith(lowerCaseSearchString)) return 3;
      if (typeof product.name === 'string' && product.name.toLowerCase().includes(lowerCaseSearchString)) return 4;
      if (typeof product.subname === 'string' && product.subname.toLowerCase().includes(lowerCaseSearchString)) return 5;
      if (typeof product.productCategory === 'string' && product.productCategory.toLowerCase().includes(lowerCaseSearchString)) return 6;
      return 7;
    };
    return getPriority(a) - getPriority(b);
  });

  // Удаление дубликатов
  const uniqueResults = Array.from(new Set(sortedResults.map((product) => product.id))).map(
    (id) => sortedResults.find((product) => product.id === id)
  );

  return uniqueResults;
};
