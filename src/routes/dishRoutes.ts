// src/routes/dishRoutes.ts
import { Router } from 'express';
import { createDishByMeasureId, createDishByProductId, createMultipleDishesByProductId, getDishes, getDishById, updateDishByMeasureId, updateDishByProductId, deleteDishById } from '../controllers/dishController';

const router = Router();

// Маршруты для создания блюд
router.post('/by-measure-id', createDishByMeasureId);
router.post('/by-product-id', createDishByProductId);
router.post('/multiple-by-product-id', createMultipleDishesByProductId);
router.get('/', getDishes);
router.get('/:id', getDishById);
router.put('/by-measure-id/:id', updateDishByMeasureId);
router.put('/by-product-id/:id', updateDishByProductId);
router.delete('/:id', deleteDishById);

export { router as dishRoutes };
