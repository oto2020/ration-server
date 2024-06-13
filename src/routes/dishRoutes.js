// src/routes/dishRoutes.js

const { Router } = require('express');
const { 
    createDishByMeasureId, 
    createDishByProductId, 
    createMultipleDishesByProductId, 
    getDishes, 
    getDishById, 
    updateDishByMeasureId, 
    updateDishByProductId, 
    deleteDishById 
} = require('../controllers/dishController');

const router = Router();

router.post('/by-measure-id', createDishByMeasureId);
router.post('/by-product-id', createDishByProductId);
router.post('/multiple-by-product-id', createMultipleDishesByProductId);
router.get('/', getDishes);
router.get('/:id', getDishById);
router.put('/by-measure-id/:id', updateDishByMeasureId);
router.put('/by-product-id/:id', updateDishByProductId);
router.delete('/:id', deleteDishById);

module.exports = router;
