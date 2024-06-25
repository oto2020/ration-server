// src/services/productService.js

const { PrismaClient } = require('@prisma/client');
const { fields } = require('./fields');

const prisma = new PrismaClient();

// Создание продукта
const createNewProduct = async (productData) => {
  // Убедитесь, что measures существует и добавьте 'грамм', если его нет
  productData.measures = productData.measures || [];
  if (!productData.measures.find((measure) => measure.name === 'грамм')) {
    productData.measures.push({
      name: 'грамм',
      value: 0.01,
      desc: ''
    });
  }
  // Убедитесь, что nutritionFacts существует
  productData.nutritionFacts = productData.nutritionFacts || [];

  return prisma.product.create({
    data: {
      ...productData, // казалось бы все поля
      measures: {
        create: productData.measures, // но вложения нужно описать дополнительно
      },
      nutritionFacts: {
        create: productData.nutritionFacts
      }
    },
  });
};

// Получение всех продуктов (все поля)
const fetchProducts = async (mode) => {
  return prisma.product.findMany({
    select: {
      ...fields['productDefault'],
      nutritionFacts: {
        select: {...fields[mode]}
      }
    }
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
  return prisma.product.findUnique({
    where: { id },
    select: {
      ...fields['productDefault'],
      nutritionFacts: {
        select: {...fields[mode]}
      }
    }
  });
};

// // Обновление продукта
// const updateProduct = async (id, productData) => {
//   const { measures, ...productFields } = productData;

//   // Если Measures не передали, значит обновляем без Measures
//   if (!Measures) {
//     return prisma.product.update({
//       where: { id },
//       data: {
//         ...productFields
//       },
//     });
//   }
  
//   // Проверка наличия объекта с name == "грамм"
//   const hasGramMeasure = productData.Measures.some((measure) => measure.name === 'грамм');
//   // Если объекта нет, добавляем его
//   if (!hasGramMeasure) {
//     productData.Measures.push({
//       name: 'грамм',
//       value: 0.01,
//       desc: ''
//     });
//   }

//   return prisma.product.update({
//     where: { id },
//     data: {
//       ...productFields,
//       Measures: productData.Measures ? {
//         deleteMany: {},
//         create: productData.Measures,
//       } : undefined,
//     },
//   });
// };

// // Удаление продукта
// const deleteProduct = async (id) => {
//   return prisma.product.delete({
//     where: { id },
//   });
// };

const searchProducts = async (searchString, mode) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  const searchWords = lowerCaseSearchString.split(/\s+/); // Разбиваем строку на слова

  // Выполняем запрос для каждого слова и объединяем результаты
  const searchPromises = searchWords.map(async (word) => {
    return await prisma.product.findMany({
      select: {
        ...fields['productDefault'],
        nutritionFacts: {
          select: { ...fields[mode] },
        },
      },
      where: {
        OR: [
          { name: { startsWith: word } },
          { subname: { startsWith: word } },
          { categoryname: { startsWith: word } },
          { name: { contains: word } },
          { subname: { contains: word } },
          { categoryname: { contains: word } },
        ],
      },
    });
  });

  // Ожидаем выполнения всех запросов
  const resultsArray = await Promise.all(searchPromises);
  
  // Объединяем результаты в один массив
  const combinedResults = resultsArray.flat();

  // Удаление дубликатов
  const uniqueResults = Array.from(new Set(combinedResults.map((product) => product.id))).map(
    (id) => combinedResults.find((product) => product.id === id)
  );

  // Сортировка результатов по приоритету
  const sortedResults = uniqueResults.sort((a, b) => {
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

  return sortedResults;
};



module.exports = {
  createNewProduct,
  fetchProducts,
  fetchProductCategories,
  fetchProductById,
  // updateProduct,
  // deleteProduct,
  searchProducts
};
