// src/routes/productRoutes.js

const { Router } = require('express');

const {
  create, 
  fetch, 
  fetchById,
  fetchCategories,
  search
} = require('../services/productService');

const router = Router();

// create
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await create(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

// fetch or search
router.get('/', async (req, res) => {
  try {
    const mode = req.query.mode || 'full';
    const searchQuery = req.query.search;
    
    console.log(`getProducts ${mode} ${searchQuery}`);
    let products = searchQuery ? await search(searchQuery, mode) : await fetch(mode);
    res.status(200).json(products);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// fetchCategories
router.get('/categories', async (req, res) => {
  try {
    let productCategories = await fetchCategories();
    res.status(200).json(productCategories);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// fetchById
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mode = req.query.mode || 'full';
    const product = await fetchById(Number(id), mode);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

module.exports = router;
