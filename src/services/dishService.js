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
        in: dishData.dishMeasures.map(dm => dm.measureId) // набор measureId берём на ходу
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

// // Вспомогательная функция получения единиц измерения по массиву id продукта
// async function getMeasuresByProductIds (productIds) {
//   return prisma.measure.findMany({
//     where: {
//       productId: {
//         in: productIds,
//       },
//       name: 'грамм',
//     },
//     include: {
//       product: true,
//     },
//   });
// };

// // Создание блюда с productId
// const createByProductId = async (dishData) => {
//   console.log('.\n.\n.\n.\n.\n.\ncreateByProductId');
//   if (!Array.isArray(dishData.products)) {
//     throw new Error("products must be an array");
//   }
  
//   let productIds = dishData.products.map(p => p.productId);
//   let measures = await getMeasuresByProductIds(productIds);

//   // суммарные значения по блюду
//   let weight = 0;   // общий вес блюда
//   let totals = {};  // калькулируемые поля
//   let calcFields = Object.keys(fields['full']);  // массив строк с наименованиями калькулируемых полей
//   calcFields.forEach(field => { totals[field] = 0; });  // задаем 0 калькулируемым полям

//   dishData.products.forEach((productData) => {
//     let measure = measures.find(m => m.productId === productData.productId);
//     if (!measure) {
//       throw new Error(`Measure with name 'грамм' not found for productId ${productData.productId}`);
//     }

//     let measureValue = measure.value;
//     let product = measure.product;
//     let productWeight = productData.value; // вес продукта в граммах
//     weight += productWeight;

//     calcFields.forEach(field => {
//       if (product[field] !== undefined) {
//         totals[field] += (product[field] * productWeight) / 100;
//       }
//     });
//   });

//   // нормализуем, чтобы значения были на 100г продукта
//   totals = Object.keys(totals).reduce((acc, key) => {
//     acc[key] = totals[key] * 100 / weight;
//     return acc;
//   }, {});

//   console.log(totals);
//   console.log(weight);

//   return prisma.dish.create({
//     data: {
//       name: dishData.name,
//       description: dishData.description,
//       categoryname: dishData.categoryname,
//       weight: weight,
//       ...totals,
//       measures: {
//         create: dishData.products.map(product => ({
//           measure: { connect: { id: measures.find(m => m.productId === product.productId).id } },
//           value: product.value,
//         })),
//       },
//     },
//   });
// };



// const fetchDishes = async (mode) => {
//   const calcFields = fields[mode] || fields['full'];
//   const selectedDishFields = {
//     ...fields['dishDefault'],
//     ...calcFields,
//   };
//   const selectedProductFields = {
//     ...fields['productDefault'],
//     ...calcFields,
//   };
//   let dishes = await prisma.dish.findMany({
//     include: {
//       measures: {
//         include: {
//           measure: {
//             include: {
//               product: {
//                 select: selectedProductFields
//               }
//             }
//           }
//         },
//       },
//     }
//   });

//   // отбор необходимых полей
//   dishes = dishes.map(dish => {
//     const selectedDish = {};
//     for (const field in selectedDishFields) {
//       if (dish.hasOwnProperty(field)) {
//         selectedDish[field] = dish[field];
//       }
//     }
//     // Добавляем включенные данные
//     selectedDish.measures = dish.measures;
//     return selectedDish;
//   });

//   console.log(dishes);
//   return dishes;
// };


// const fetchDishById = async (id, mode) => {
//   const calcFields = fields[mode] || fields['full'];
//   const selectedDishFields = {
//     ...fields['dishDefault'],
//     ...calcFields,
//   };
//   const selectedProductFields = {
//     ...fields['productDefault'],
//     ...calcFields,
//   };

//   // Получение данных с использованием include
//   let dish = await prisma.dish.findUnique({
//     where: { id: parseInt(id) },
//     include: {
//       measures: {
//         include: {
//           measure: {
//             include: {
//               product: {
//                 select: selectedProductFields
//               }, // Включаем все поля для дальнейшей фильтрации
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!dish) {
//     throw new Error(`Dish with ID ${id} not found`);
//   }

//   // Функция для фильтрации полей объекта
//   const filterFields = (object, fields) => {
//     return Object.keys(object)
//       .filter(key => fields[key])
//       .reduce((acc, key) => {
//         acc[key] = object[key];
//         return acc;
//       }, {});
//   };

//   // Отбор только необходимых полей для Dish
//   const selectedDish = filterFields(dish, selectedDishFields);

//   // Обработка measures и фильтрация полей продукта
//   selectedDish.measures = dish.measures.map(measure => ({
//     ...measure,
//     measure: {
//       ...measure.measure,
//       product: filterFields(measure.measure.product, selectedProductFields),
//     },
//   }));

//   return selectedDish;
// };

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
  // createByProductId,
  // fetchDishes,
  // fetchDishById,
  // updateByMeasureId,
  // updateByProductId,
  // deleteDish,
};
