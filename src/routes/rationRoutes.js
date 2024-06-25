// src/routes/productRoutes.js

const { Router } = require('express');
const {
  createRation,
  // getRations,
  // getRationById,
  // updateRationById,
  // deleteRationById,
} = require('../controllers/rationController');

const router = Router();

router.post('/', createRation);
// router.get('/', getRations);
// router.get('/:id', getRationById);
// router.put('/:id', updateRationById);
// router.delete('/:id', deleteRationById);

module.exports = router;
