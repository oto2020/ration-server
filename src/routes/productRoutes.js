// src/routes/productRoutes.js

const { Router } = require('express');
const {
  createProduct,
  getProducts,
  getProductCategories,
  getProductById,
  updateProductById,
  deleteProductById,
} = require('../controllers/productController');

const router = Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);
router.put('/:id', updateProductById);
router.delete('/:id', deleteProductById);

module.exports = router;
