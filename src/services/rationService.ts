// src/services/rationService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RationData = {
  name: string;
  description: string;
  startDate: Date;
  dishes: {
    dishId: number;
    value: number;
    mealType: string;
    dayNumber: number;
    userId?: number;
  }[];
};

// Создание рациона
export const createRationByDishId = async (rationData: RationData) => {
  return prisma.ration.create({
    data: {
      name: rationData.name,
      description: rationData.description,
      startDate: rationData.startDate,
      dishes: {
        create: rationData.dishes.map(dish => ({
          dish: { connect: { id: dish.dishId } },
          value: dish.value,
          mealType: dish.mealType,
          dayNumber: dish.dayNumber,
          userId: dish.userId || 1,
        })),
      },
    },
  });
};

// Получение всех рационов
export const fetchRations = async () => {
  return prisma.ration.findMany({
    include: {
      dishes: true,
    },
  });
};

// Получение рациона по id
export const fetchRationById = async (id: number) => {
  return prisma.ration.findUnique({
    where: { id },
    include: {
      dishes: {
        include: {
          dish: true,
        },
      },
    },
  });
};

// Обновление рациона
export const updateRationById = async (id: number, rationData: RationData) => {
  return prisma.ration.update({
    where: { id },
    data: {
      name: rationData.name,
      description: rationData.description,
      startDate: rationData.startDate,
      dishes: {
        deleteMany: {},
        create: rationData.dishes.map(dish => ({
          dish: { connect: { id: dish.dishId } },
          value: dish.value,
          mealType: dish.mealType,
          dayNumber: dish.dayNumber,
          userId: dish.userId || 1,
        })),
      },
    },
  });
};

// Удаление рациона
export const deleteRationById = async (id: number) => {
  return prisma.ration.delete({
    where: { id },
  });
};
