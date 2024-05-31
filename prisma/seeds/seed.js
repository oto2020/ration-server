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
            const { Measures, id, ...productData } = product;

            // Вставка продукта
            const createdProduct = await prisma.product.create({
                data: {
                    ...productData,
                    Measures: {
                        create: Measures.map(measure => ({
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
