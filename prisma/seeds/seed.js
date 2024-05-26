const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // Чтение данных из JSON-файлов
  const productData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'arrProducts.json')));
  const clearWeightData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'arrProductClearWeights.json')));
  const measureData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'arrProductMeasures.json')));

  // Наполнение таблицы Product
  for (const product of productData) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        subname: product.subname,
        productCategory: product.productCategory,
        kcal: product.kcal,
        protein: product.protein,
        fat: product.fat,
        carbohydrate: product.carbohydrate,
        fiber: product.fiber,
        sugar: product.sugar,
        ash: product.ash,
        starch: product.starch,
        calcium: product.calcium,
        iron: product.iron,
        magnesium: product.magnesium,
        phosphorus: product.phosphorus,
        potassium: product.potassium,
        sodium: product.sodium,
        zinc: product.zinc,
        copper: product.copper,
        manganese: product.manganese,
        selenium: product.selenium,
        vitamin_a: product.vitamin_a,
        vitamin_b3: product.vitamin_b3,
        vitamin_b4: product.vitamin_b4,
        vitamin_b5: product.vitamin_b5,
        vitamin_b6: product.vitamin_b6,
        vitamin_b9: product.vitamin_b9,
        vitamin_c: product.vitamin_c,
        vitamin_e: product.vitamin_e,
        vitamin_k: product.vitamin_k,
        alpha_carotene: product.alpha_carotene,
        beta_carotene: product.beta_carotene,
        chole: product.chole,
        trans: product.trans,
        water: product.water,
      },
    });
  }

  // Наполнение таблицы ProductClearWeight
  for (const clearWeight of clearWeightData) {
    await prisma.productClearWeight.create({
      data: {
        productId: clearWeight.productId,
        name: clearWeight.name,
        value: clearWeight.value,
        desc: clearWeight.desc,
      },
    });
  }

  // Наполнение таблицы ProductMeasure
  for (const measure of measureData) {
    await prisma.productMeasure.create({
      data: {
        productId: measure.productId,
        name: measure.name,
        value: measure.value,
        desc: measure.desc,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
