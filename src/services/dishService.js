// src/services/dishService.js

const { PrismaClient } = require('@prisma/client');
const { fields } = require('./fields');

const prisma = new PrismaClient();

// Вспомогательная функция получения единиц измерения по id для measures и products
async function calculate(dishData) {
  let productMeasures = [];
  if (Array.isArray(dishData.measures)) {
    let productMeasureIds = dishData.measures.map(m => m.id);
    productMeasures = await prisma.productMeasure.findMany({
      select: {
        id: true,
        name: true,
        grams: true,
        product: {
          include: {
            nutritionFacts: {
              select: fields['full']
            }
          }
        }
      },
      where: {
        id: {
          in: productMeasureIds
        }
      }
    });
    // дополним наш мега-объект полем count из входных данных measures
    productMeasures =  productMeasures.map(productMeasure => {
      let count = dishData.measures.filter(m => m.id === productMeasure.id)[0].count;
      return {
        productMeasureId: productMeasure.id, 
        grams: productMeasure.grams, 
        count: count, 
        nutritionFacts: productMeasure.product.nutritionFacts
      }
    });
  }
  if (Array.isArray(dishData.products)) {
    let productIds = dishData.products.map(p => p.id);
    productMeasures = await prisma.productMeasure.findMany({
      select: {
        id: true,
        name: true,
        grams: true,
        product: {
          include: {
            nutritionFacts: {
              select: fields['full']
            }
          }
        }
      },
      where: {
        id: {
          in: productIds
        },
        name: 'грамм'
      }
    });
    // дополним наш мега-объект полем count из входных данных products
    productMeasures = productMeasures.map(productMeasure => {
      let count = dishData.products.filter(p => p.id === productMeasure.id)[0].count;
      return {
        productMeasureId: productMeasure.id, 
        grams: productMeasure.grams, 
        count: count, 
        nutritionFacts: productMeasure.product.nutritionFacts
      }
    });
  }

  // Ипользуя искуственный массив объектов parts посчитаем общий вес и нутриенты
  let nutritionFacts = {};  // пустой объект со всеми полями-нутриентами
  let nutritionFactsKeys = Object.keys(fields['full']);
  nutritionFactsKeys.forEach(key => nutritionFacts[key] = 0);
  let weight = 0;
  // имея все задействованные единицы измерения
  productMeasures.forEach(part => {
    weight += part.count * part.grams; // два банана * вес банана в граммах
    nutritionFactsKeys.forEach(key => {
      nutritionFacts[key] += part.count * part.grams * part.nutritionFacts[key]; // собираем суммарный набор параметров для блюда
    })
  });
  // нормализуем под КБЖУ и другие нутриенты на 100 г
  nutritionFactsKeys.forEach(key => nutritionFacts[key] /= weight);
  // console.log(nutritionFacts, weight);
  return {measures: productMeasures, nutritionFacts: nutritionFacts, weight: weight}
}


// Создание блюда с measureId
const create = async (dishData) => {
  console.log('.\n.\n.\n.\n.\n.\ncreateByMeasureId');

  if (!(Array.isArray(dishData.measures) || Array.isArray(dishData.products))) {
    throw new Error("Нужно передать массив 'measures' или 'products' с id ед. изм. продукта и количеством [{id, count}, и т.д. ...]");
  }

  // Отдельно по единицам измерения самого продукта - порциям:
  // Убедитесь, что dishMeasures существует и добавьте 'грамм', если его нет
  dishData.dishMeasures = dishData.dishMeasures || [];
  if (!dishData.dishMeasures.find((dishMeasure) => dishMeasure.name === 'грамм')) {
    dishData.dishMeasures.push({
      name: 'грамм',
      grams: 1,
      desc: ''
    });
  }

  // получим measures, nutritionFacts и weigth
  // measures могли не содержаться, если был передан products
  let calculated = await calculate(dishData);

  // создадим блюда
  return prisma.dish.create({
    data: {
      name: dishData.name,
      description: dishData.description || '',
      categoryname: dishData.categoryname || '',
      dishMeasures: {
        create: dishData.dishMeasures
      },
      dishProductMeasureCounts: {
        create: calculated.measures.map(m => ({
          productMeasure: { connect: { id: m.productMeasureId } },
          count: m.count,
        })),
      },
      // вычисляемые поля
      nutritionFacts: {
        create: calculated.nutritionFacts
      },
      weight: calculated.weight
    },
  });

};

// получение всех блюд
const fetch = async (mode) => {
  return prisma.dish.findMany({
    select: {
      ...fields['dishDefault'],
      dishProductMeasureCounts: {
        include: {
          productMeasure: {
            include: {
              product: {
                include: {
                  nutritionFacts: {
                    select: {...(fields[mode] || fields['full'])}
                  }
                }
              }
            }
          }
        }
      },
      nutritionFacts: {
        select: {...(fields[mode] || fields['full'])}
      }
    }
  });
};


// получение блюда по Id
const fetchById = async (id, mode) => {
  return prisma.dish.findUnique({
    select: {
      ...fields['dishDefault'],
      dishProductMeasureCounts: {
        include: {
          productMeasure: {
            include: {
              product: {
                include: {
                  nutritionFacts: {
                    select: {...(fields[mode] || fields['full'])}
                  }
                }
              }
            }
          }
        }
      },
      nutritionFacts: {
        select: {...(fields[mode] || fields['full'])}
      }
    },
    where: {
      id: parseInt(id),
    }
  });
};


const search = async (searchString, mode) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  const searchWords = lowerCaseSearchString.split(/\s+/); // Разбиваем строку на слова

  // Выполняем запрос для каждого слова и объединяем результаты
  const searchPromises = searchWords.map(async (word) => {
    return await prisma.dish.findMany({
      select: {
        ...fields['dishSearch'],
        nutritionFacts: {
          select: {...(fields[mode] || fields['full'])},
        },
      },
      where: {
        OR: [
          { name: { startsWith: word } },
          { categoryname: { startsWith: word } },
          { description: { startsWith: word } },
          { name: { contains: word } },
          { categoryname: { contains: word } },
          { description: { contains: word } },
        ],
      },
    });
  });

  // Ожидаем выполнения всех запросов
  const resultsArray = await Promise.all(searchPromises);
  
  // Объединяем результаты в один массив
  const combinedResults = resultsArray.flat();

  // Удаление дубликатов
  const uniqueResults = Array.from(new Set(combinedResults.map((dish) => dish.id))).map(
    (id) => combinedResults.find((dish) => dish.id === id)
  );

  // Сортировка результатов по приоритету
  const sortedResults = uniqueResults.sort((a, b) => {
    const getPriority = (dish) => {
      if (typeof dish.name === 'string' && dish.name.toLowerCase().startsWith(lowerCaseSearchString)) return 1;
      if (typeof dish.categoryname === 'string' && dish.categoryname.toLowerCase().startsWith(lowerCaseSearchString)) return 2;
      if (typeof dish.description === 'string' && dish.description.toLowerCase().startsWith(lowerCaseSearchString)) return 3;
      if (typeof dish.name === 'string' && dish.name.toLowerCase().includes(lowerCaseSearchString)) return 4;
      if (typeof dish.categoryname === 'string' && dish.categoryname.toLowerCase().includes(lowerCaseSearchString)) return 5;
      if (typeof dish.description === 'string' && dish.description.toLowerCase().includes(lowerCaseSearchString)) return 6;
      return 7;
    };
    return getPriority(a) - getPriority(b);
  });

  return sortedResults;
};

// const updateByMeasureId = async (id, dishData) => {
//   if (!Array.isArray(dishData.measures)) {
//     throw new Error("measures must be an array");
//   }

//   return prisma.dish.update({
//     where: { id },
//     data: {
//       name: dishData.name,
//       description: dishData.description,
//       measures: {
//         deleteMany: {},
//         create: dishData.measures.map(measure => ({
//           measure: { connect: { id: measure.measureId } },
//           grams: measure.grams,
//         })),
//       },
//     },
//   });
// };

// const updateByProductId = async (id, dishData) => {
//   if (!Array.isArray(dishData.products)) {
//     throw new Error("measures must be an array");
//   }

//   const measuresWithGram = await Promise.all(dishData.products.map(async (product) => {
//     const gramMeasure = await prisma.measure.findFirst({
//       where: {
//         productId: product.productId,
//         name: 'грамм'
//       }
//     });

//     if (!gramMeasure) {
//       throw new Error(`Measure with name 'грамм' not found for productId ${product.productId}`);
//     }

//     return {
//       measureId: gramMeasure.id,
//       grams: product.grams
//     };
//   }));

//   return prisma.dish.update({
//     where: { id },
//     data: {
//       name: dishData.name,
//       description: dishData.description,
//       measures: {
//         deleteMany: {},
//         create: measuresWithGram.map(measure => ({
//           measure: { connect: { id: measure.measureId } },
//           grams: measure.grams,
//         })),
//       },
//     },
//   });
// };

// const deleteDish = async (id) => {
//   return prisma.dish.delete({
//     where: { id },
//   });
// };

module.exports = {
  create,
  fetch,
  fetchById,
  search,
  // updateByMeasureId,
  // updateByProductId,
  // deleteDish,
};
