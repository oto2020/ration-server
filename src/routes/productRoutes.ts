import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductCategories,
  getProductById,
  updateProductById,
  deleteProductById,
} from '../controllers/productController';

const router = Router();


// api/products
router.post('/', createProduct);
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);
router.put('/:id', updateProductById);
router.delete('/:id', deleteProductById);

export { router as productRoutes };
