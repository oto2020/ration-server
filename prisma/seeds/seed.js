const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Функция для чтения JSON файла
const readJsonFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

// Основная функция для наполнения базы данных
const seedDatabase = async () => {
    try {
        const products = await readJsonFile('./prisma/seeds/productsWithMeasures.json');

        for (const product of products) {
            const { measures, id, kcal, mainFats, mainProteins, mainCarb, mainWater, mainAsh,
                    subSugar, subFiber, subStarch, subTransfats, vitamin_a, beta_carotene,
                    alpha_carotene, vitamin_e, vitamin_k, vitamin_c, vitamin_b1, vitamin_b3,
                    vitamin_b4, vitamin_b5, vitamin_b6, vitamin_b9, vitamin_b12, vitamin_b2,
                    vitamin_d, vitamin_d2, vitamin_d3, calcium, fluoride, iron, magnesium,
                    phosphorus, potassium, sodium, zinc, copper, manganese, selenium, 
                    ...productData } = product;

            // Вставка NutritionFacts
            const nutritionFacts = await prisma.nutritionFacts.create({
                data: {
                    kcal,
                    mainFats,
                    mainProteins,
                    mainCarb,
                    mainWater,
                    mainAsh,
                    subSugar,
                    subFiber,
                    subStarch,
                    subTransfats,
                    vitamin_a,
                    beta_carotene,
                    alpha_carotene,
                    vitamin_e,
                    vitamin_k,
                    vitamin_c,
                    vitamin_b1,
                    vitamin_b3,
                    vitamin_b4,
                    vitamin_b5,
                    vitamin_b6,
                    vitamin_b9,
                    vitamin_b12,
                    vitamin_b2,
                    vitamin_d,
                    vitamin_d2,
                    vitamin_d3,
                    calcium,
                    fluoride,
                    iron,
                    magnesium,
                    phosphorus,
                    potassium,
                    sodium,
                    zinc,
                    copper,
                    manganese,
                    selenium
                }
            });

            // Вставка продукта с привязкой к NutritionFacts
            const createdProduct = await prisma.product.create({
                data: {
                    ...productData,
                    nutritionFactsId: nutritionFacts.id,
                    measures: {
                        create: measures.map(measure => ({
                            name: measure.name,
                            value: measure.value,
                            desc: measure.desc
                        }))
                    }
                }
            });

            console.log(`Продукт ${createdProduct.name} успешно добавлен`);
        }

        console.log('База данных успешно наполнена');
    } catch (err) {
        console.error('Ошибка при наполнении базы данных:', err);
    } finally {
        await prisma.$disconnect();
    }
};

seedDatabase();
