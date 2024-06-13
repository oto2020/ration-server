// src/controllers/dishController.js

const { 
  createByMeasureId, 
  createByProductId, 
  createMultipleByProductId, 
  fetchDishes, 
  fetchDishById, 
  updateByMeasureId, 
  updateByProductId, 
  deleteDish 
} = require('../services/dishService');

const createDishByProductId = async (req, res) => {
  try {
    const dishData = req.body;
    const newDish = await createByProductId(dishData);
    res.status(201).json(newDish);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

const createDishByMeasureId = async (req, res) => {
  try {
    const dishData = req.body;
    const newDish = await createByMeasureId(dishData);
    res.status(201).json(newDish);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

const getDishes = async (req, res) => {
  try {
    const mode = req.query.mode || 'full';
    const dishes = await fetchDishes(mode);
    res.status(200).json(dishes);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

const getDishById = async (req, res) => {
  try {
    const mode = req.query.mode || 'full';
    const { id } = req.params;
    const dish = await fetchDishById(Number(id), mode);
    if (dish) {
      res.status(200).json(dish);
    } else {
      res.status(404).json({ error: 'Dish not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

const updateDishByMeasureId = async (req, res) => {
  try {
    const { id } = req.params;
    const dishData = req.body;
    const updatedDish = await updateByMeasureId(Number(id), dishData);
    res.status(200).json(updatedDish);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

const updateDishByProductId = async (req, res) => {
  try {
    const { id } = req.params;
    const dishData = req.body;
    const updatedDish = await updateByProductId(Number(id), dishData);
    res.status(200).json(updatedDish);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

const deleteDishById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDish(Number(id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

const createMultipleDishesByProductId = async (req, res) => {
  try {
    const dishesData = req.body.dishes;
    const newDishes = await createMultipleByProductId(dishesData);
    res.status(201).json(newDishes);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

module.exports = {
  createDishByProductId,
  createDishByMeasureId,
  getDishes,
  getDishById,
  updateDishByMeasureId,
  updateDishByProductId,
  deleteDishById,
  createMultipleDishesByProductId,
};
