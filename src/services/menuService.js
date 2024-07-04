// src/services/menuService.js

const { PrismaClient } = require('@prisma/client');
const { fields } = require('./fields');

const prisma = new PrismaClient();

// Вспомогательная функция получения единиц измерения по id для measures и products
async function calculate(menuData) {
  let productMeasures = [];
  if (Array.isArray(menuData.products)) {
    let productIds = menuData.products.map(p => p.id);
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
        }
      }
    });
    // дополним наш мега-объект полем count из входных данных products
    productMeasures = productMeasures.map(productMeasure => {
      let menuDataProduct = menuData.products.filter(p => p.id === productMeasure.id)[0];
      let { count, mealNumber } = menuDataProduct;
      return {
        productMeasureId: productMeasure.id, 
        mealNumber: mealNumber,
        grams: productMeasure.grams, 
        count: count, 
        nutritionFacts: productMeasure.product.nutritionFacts
      }
    });
  }


  let dishMeasures = [];
  if (Array.isArray(menuData.dishes)) {
    let dishIds = menuData.dishes.map(d => d.id);
    dishMeasures = await prisma.dishMeasure.findMany({
      select: {
        id: true,
        name: true,
        grams: true,
        dish: {
          include: {
            nutritionFacts: {
              select: fields['full']
            }
          }
        }
      },
      where: {
        id: {
          in: dishIds
        }
      }
    });
    // дополним наш мега-объект полем count из входных данных products
    dishMeasures = dishMeasures.map(dishMeasure => {
      let menuDataDish = menuData.dishes.filter(p => p.id === dishMeasure.id)[0];
      let { count, mealNumber } = menuDataDish;
      return {
        dishMeasureId: dishMeasure.id, 
        mealNumber: mealNumber,
        grams: dishMeasure.grams, 
        count: count, 
        nutritionFacts: dishMeasure.dish.nutritionFacts
      }
    });
  }



  // Ипользуя искуственный массив объектов parts посчитаем общий вес и нутриенты
  let nutritionFacts = {};  // пустой объект со всеми полями-нутриентами
  let nutritionFactsKeys = Object.keys(fields['full']);
  nutritionFactsKeys.forEach(key => nutritionFacts[key] = 0);
  let weight = 0;
  // по продуктам
  productMeasures.forEach(part => {
    weight += part.count * part.grams; // два банана * вес банана в граммах
    nutritionFactsKeys.forEach(key => {
      nutritionFacts[key] += part.count * part.grams * part.nutritionFacts[key]; // собираем суммарный набор параметров для блюда
    })
  });
  // по блюдам
  dishMeasures.forEach(part => {
    weight += part.count * part.grams; // два банана (две порции) * вес банана (вес порции) в граммах
    nutritionFactsKeys.forEach(key => {
      nutritionFacts[key] += part.count * part.grams * part.nutritionFacts[key]; // собираем суммарный набор параметров для меню
    })
  });

  // нормализуем под КБЖУ и другие нутриенты на 100 г
  nutritionFactsKeys.forEach(key => nutritionFacts[key] /= weight);
  // console.log(nutritionFacts, weight);
  return {dishes: dishMeasures, products: productMeasures, nutritionFacts: nutritionFacts, weight: weight}
}


// Создание блюда с measureId
const create = async (menuData) => {
  
  if (!(Array.isArray(menuData.products) || Array.isArray(menuData.dishes))) {
    throw new Error("Нужно передать массив 'dishes' или 'products' с id ед. изм. продукта и количеством [{id, count}, и т.д. ...]");
  }

  // получим measures, nutritionFacts и weigth
  // measures могли не содержаться, если был передан products
  let calculated = await calculate(menuData);

  // return;
  // создадим меню
  return prisma.menu.create({
    data: {
      name: menuData.name,
      description: menuData.description || '',
      menuProductMeasureCounts: {
        create: calculated.products.map(m => ({
          productMeasure: { connect: { id: m.productMeasureId } },
          count: m.count,
          mealNumber: m.mealNumber,
        })),
      },
      menuDishMeasureCounts: {
        create: calculated.dishes.map(m => ({
          dishMeasure: { connect: { id: m.dishMeasureId } },
          count: m.count,
          mealNumber: m.mealNumber,
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
