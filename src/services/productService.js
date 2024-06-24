// src/services/productService.js

const { PrismaClient } = require('@prisma/client');
const { fields } = require('./fields');

const prisma = new PrismaClient();

// Создание продукта
const createNewProduct = async (productData) => {
  // Проверка наличия массива productData.Measures
  if (!productData.Measures) {
    productData.Measures = [];
  }
  // Проверка наличия объекта с name == "грамм"
  const hasGramMeasure = productData.Measures.some((measure) => measure.name === 'грамм');
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
const fetchProducts = async (mode) => {
  const selectedFields = {
    ...fields['productDefault'],
    ...(fields[mode] || fields['full']),
  };
  return prisma.product.findMany({
    select: selectedFields
  });
};

// Получение категорий продуктов и количества продуктов, относящихся к категории
const fetchProductCategories = async () => {
  const categories = await prisma.product.groupBy({
    by: ['categoryname'],
    _count: {
      categoryname: true,
    },
  });

  return categories.map(category => ({
    category: category.categoryname,
    count: category._count.categoryname,
  }));
};

// Получение продукта по id
const fetchProductById = async (id, mode) => {
  const selectedFields = {
    ...fields['productDefault'],
    ...(fields[mode] || fields['full']),
  };
  return prisma.product.findUnique({
    where: { id },
    select: selectedFields
  });
};

// Обновление продукта
const updateProduct = async (id, productData) => {
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
  const hasGramMeasure = productData.Measures.some((measure) => measure.name === 'грамм');
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
const deleteProduct = async (id) => {
  return prisma.product.delete({
    where: { id },
  });
};

// Поиск продуктов (только главные поля) по текстовым полям с приоритезацией 
const searchProducts = async (searchString, mode) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  const selectedFields = {
    ...fields['productDefault'],
    ...(fields[mode] || fields['full']),
  };

  // Выполнение единственного запроса с объединением всех условий
  const results = await prisma.product.findMany({
    select: selectedFields,
    where: {
      OR: [
        { name: { startsWith: lowerCaseSearchString } },
        { subname: { startsWith: lowerCaseSearchString } },
        { categoryname: { startsWith: lowerCaseSearchString } },
        { name: { contains: lowerCaseSearchString } },
        { subname: { contains: lowerCaseSearchString } },
        { categoryname: { contains: lowerCaseSearchString } },
      ],
    },
  });

  // Сортировка результатов по приоритету
  const sortedResults = results.sort((a, b) => {
    const getPriority = (product) => {
      if (typeof product.name === 'string' && product.name.toLowerCase().startsWith(lowerCaseSearchString)) return 1;
      if (typeof product.subname === 'string' && product.subname.toLowerCase().startsWith(lowerCaseSearchString)) return 2;
      if (typeof product.categoryname === 'string' && product.categoryname.toLowerCase().startsWith(lowerCaseSearchString)) return 3;
      if (typeof product.name === 'string' && product.name.toLowerCase().includes(lowerCaseSearchString)) return 4;
      if (typeof product.subname === 'string' && product.subname.toLowerCase().includes(lowerCaseSearchString)) return 5;
      if (typeof product.categoryname === 'string' && product.categoryname.toLowerCase().includes(lowerCaseSearchString)) return 6;
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

module.exports = {
  createNewProduct,
  fetchProducts,
  fetchProductCategories,
  fetchProductById,
  updateProduct,
  deleteProduct,
  searchProducts
};
