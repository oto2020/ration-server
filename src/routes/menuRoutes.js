// src/routes/menuRoutes.js

const { Router } = require('express');
const { 
    create,
    // fetch, 
    // fetchById, 
    // search
  } = require('../services/menuService');

const router = Router();

// create
router.post('/', async (req, res) => {
    try {
        const menuData = req.body;
        const newMenu = await create(menuData);
        res.status(201).json(newMenu);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});

// // fetch or search
// router.get('/', async (req, res) => {
//     try {
//         const mode = req.query.mode || 'full';
//         const searchQuery = req.query.search;
//         let dishes = searchQuery ? await search(searchQuery, mode) : await fetch(mode);
//         res.status(200).json(dishes);
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(500).json({ error: error.message });
//         } else {
//             res.status(500).json({ error: 'An unknown error occurred' });
//         }
//     }
//     });

// // fetchById
// router.get('/:id', async (req, res) => {
//     try {
//         const mode = req.query.mode || 'full';
//         const { id } = req.params;
//         const dish = await fetchById(Number(id), mode);
//         if (dish) {
//             res.status(200).json(dish);
//         } else {
//             res.status(404).json({ error: 'Dish not found' });
//         }
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(500).json({ error: error.message });
//         } else {
//             res.status(500).json({ error: 'An unknown error occurred' });
//         }
//     }
//     });

module.exports = router;



