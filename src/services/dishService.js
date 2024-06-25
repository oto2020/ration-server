// src/services/dishService.js

const { PrismaClient } = require('@prisma/client');
const { fields } = require('./fields');

const prisma = new PrismaClient();

// Вспомогательная функция получения единиц измерения по массиву id
async function getMeasuresByIds(measureIds) {
  return await prisma.measure.findMany({
    include: {
      product: {
        select: fields['product']
      }
    },
    where: {
      id: {
        in: measureIds
      }
    }
  });
}

// Создание блюда с measureId
const createByMeasureId = async (dishData) => {
  console.log('.\n.\n.\n.\n.\n.\ncreateByMeasureId');
  if (!Array.isArray(dishData.dishMeasures)) {
    throw new Error("dishMeasures must be an array");
  }
  
  // набор measureId берём на ходу
  let measureIds = dishData.dishMeasures.map(dm => dm.measureId) 
  // 1. научиться через measureId получать продукты и их nutrientFacts
  let measures = await prisma.measure.findMany({
    select: {
      id: true,
      name: true,
      value: true,
      product: {
        include: {
          nutritionFacts: {
            select: {...fields['full']}
          }
        }
      }
    },
    where: {
      id: {
        in: measureIds
      }
    }
  });

  console.log(measures);

  let dishNutrientFacts = {}
  dishNutrientFacts = fields['full'];
  let dishNutrientFactsKeys = Object.keys(dishNutrientFacts);
  dishNutrientFactsKeys.forEach(key => dishNutrientFacts[key] = 0);

  let dishWeight = 0;
  // имея все задействованные единицы измерения
  measures.forEach(measure => {
    // мы получали их по набору id, поэтому value приходится восстанавливать. зато запро с в БД одним запросом
    let dishMeasureValue = dishData.dishMeasures.filter(dm=>dm.measureId === measure.id)[0].value; // сколько единиц измерения
    let measureValue = measure.value; // сколько весит в граммах одна единица измерения продукта
    dishWeight += dishMeasureValue * measureValue * 100; // собираем общий вес продукта
    let productNutritionFacts = measure.product.nutritionFacts; // перечень значений нутриентов для этого продукта
    dishNutrientFactsKeys.forEach(key => {
      dishNutrientFacts[key] += dishMeasureValue * measureValue * productNutritionFacts[key]; // собираем суммарный набор параметров для блюда
    })
  })
  // нормализуем под КБЖУ и другие нутриенты на 100 г
  dishNutrientFactsKeys.forEach(key => {
    dishNutrientFacts[key] /= (dishWeight / 100); 
  })
  console.log(dishNutrientFacts, dishWeight);

  return prisma.dish.create({
    data: {
      name: dishData.name,
      description: dishData.description || '',
      categoryname: dishData.categoryname || '',
      weight: dishWeight,
      dishMeasures: {
        create: dishData.dishMeasures.map(measure => ({
          measure: { connect: { id: measure.measureId } },
          value: measure.value,
        })),
      },
      nutritionFacts: {
        create: dishNutrientFacts
      }
    },
  });
};

// Создание блюда с measureId
const createByProductId = async (dishData) => {
  console.log('.\n.\n.\n.\n.\n.\ncreateByProductId');
  if (!Array.isArray(dishData.products)) {
    throw new Error("products must be an array");
  }
  
  // основная задача заключается в том, чтобы для каждого продукта найти тот measure, который граммы
  let productIds = dishData.products.map(product => product.productId);
  let measures = await prisma.measure.findMany({
    where: {
      productId: {
        in: productIds,
      },
      name: 'грамм',
    }
  });

  // произвести восстановление привычного из предыдущей функции dishData.dishMeasures
  dishData.dishMeasures = dishData.products.map(product => {
    let measure = measures.filter(m=>m.productId === product.productId)[0];
    return { measureId: measure.id, value: product.value };
  })
  // console.log(dishData.products)
  // console.log(measures);
  // console.log(dishData.dishMeasures);

  // вызываем тот-же метод, блистательная хуцпа
  return createByMeasureId(dishData);
};


// получение всех блюд
const fetchDishes = async (mode) => {
  return prisma.dish.findMany({
    select: {
      ...fields['dishDefault'],
      dishMeasures: {
        include: {
          measure: {
            include: {
              product: {
                include: {
                  nutritionFacts: {
                    select: {...fields[mode]}
                  }
                }
              }
            }
          }
        }
      },
      nutritionFacts: {
        select: {...fields[mode]}
      }
    }
  });
};


// получение блюда по Id
const fetchDishById = async (id, mode) => {
  return prisma.dish.findUnique({
    select: {
      ...fields['dishDefault'],
      dishMeasures: {
        include: {
          measure: {
            include: {
              product: {
                include: {
                  nutritionFacts: {
                    select: {...fields[mode]}
                  }
                }
              }
            }
          }
        }
      },
      nutritionFacts: {
        select: {...fields[mode]}
      }
    },
    where: {
      id: parseInt(id),
    }
  });
};


const searchDishes = async (searchString, mode) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  const searchWords = lowerCaseSearchString.split(/\s+/); // Разбиваем строку на слова

  // Выполняем запрос для каждого слова и объединяем результаты
  const searchPromises = searchWords.map(async (word) => {
    return await prisma.dish.findMany({
      select: {
        ...fields['dishDefault'],
        nutritionFacts: {
          select: { ...fields[mode] },
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
//           value: measure.value,
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
//       value: product.value
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
//           value: measure.value,
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
  createByMeasureId,
  createByProductId,
  fetchDishes,
  fetchDishById,
  searchDishes,
  // updateByMeasureId,
  // updateByProductId,
  // deleteDish,
};
