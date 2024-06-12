// src/routes/rationRoutes.ts
import { Router } from 'express';
import {
  createRation,
  getRations,
  getRationById,
  updateRation,
  deleteRation
} from '../controllers/rationController';

const router = Router();

router.post('/', createRation);
router.get('/', getRations);
router.get('/:id', getRationById);
router.put('/:id', updateRation);
router.delete('/:id', deleteRation);

export default router;
