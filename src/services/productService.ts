import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createNewProduct = async (productData: any) => {
  return prisma.product.create({
    data: {
      ...productData,
      Measures: {
        create: productData.Measures
      }
    }
  });
};

export const fetchProducts = async () => {
  return prisma.product.findMany({
    include: {
      Measures: true
    }
  });
};

export const fetchProductsMainFields = async () => {
  return prisma.product.findMany({
    select: {
      id: true,
      productCategory: true,
      name: true,
      subname: true,
      mainFats: true,
      mainProteins: true,
      mainCarb: true,
      mainWater: true,
      mainAsh: true,
      Measures: true,
    }
  });
};

export const searchProductsMainFields = async (searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  // Определение типа результата запроса
  type ProductType = Prisma.ProductGetPayload<{
    select: {
      id: true;
      productCategory: true;
      name: true;
      subname: true;
      mainFats: true;
      mainProteins: true;
      mainCarb: true;
      mainWater: true;
      mainAsh: true;
      Measures: true;
    };
  }>;

  // Выполнение единственного запроса с объединением всех условий
  const results: ProductType[] = await prisma.product.findMany({
    select: {
      id: true,
      productCategory: true,
      name: true,
      subname: true,
      mainFats: true,
      mainProteins: true,
      mainCarb: true,
      mainWater: true,
      mainAsh: true,
      Measures: true,
    },
    where: {
      OR: [
        { name: { startsWith: lowerCaseSearchString } },
        { subname: { startsWith: lowerCaseSearchString } },
        { productCategory: { startsWith: lowerCaseSearchString } },
        { name: { contains: lowerCaseSearchString } },
        { subname: { contains: lowerCaseSearchString } },
        { productCategory: { contains: lowerCaseSearchString } },
      ],
    },
  });

  // Сортировка результатов по приоритету
  const sortedResults = results.sort((a, b) => {
    const getPriority = (product: ProductType) => {
      if (product.name.toLowerCase().startsWith(lowerCaseSearchString)) return 1;
      if (product.subname?.toLowerCase().startsWith(lowerCaseSearchString)) return 2;
      if (product.productCategory.toLowerCase().startsWith(lowerCaseSearchString)) return 3;
      if (product.name.toLowerCase().includes(lowerCaseSearchString)) return 4;
      if (product.subname?.toLowerCase().includes(lowerCaseSearchString)) return 5;
      if (product.productCategory.toLowerCase().includes(lowerCaseSearchString)) return 6;
      return 7;
    };
    return getPriority(a) - getPriority(b);
  });

  // Удаление дубликатов
  const uniqueResults = Array.from(new Set(sortedResults.map((product) => product.id))).map(
    (id) => sortedResults.find((product) => product.id === id)
  );

  return uniqueResults;
};
