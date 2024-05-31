const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const dropDatabase = async () => {
    try {
        // Drop all tables
        await prisma.$executeRaw`DROP SCHEMA IF EXISTS ration`;

        console.log('Схема базы данных успешно удалена');
    } catch (err) {
        console.error('Ошибка при удалении схемы базы данных:', err);
    } finally {
        await prisma.$disconnect();
    }
};

const deleteMigrationsFolder = () => {
    const migrationsPath = path.join(__dirname, '../migrations');
    if (fs.existsSync(migrationsPath)) {
        fs.rmSync(migrationsPath, { recursive: true, force: true });
        console.log('Папка migrations успешно удалена');
    } else {
        console.log('Папка migrations не существует');
    }
};

const main = async () => {
    await dropDatabase();
    deleteMigrationsFolder();
};

main();
