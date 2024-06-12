import { Request, Response } from 'express';
import { createByMeasureId, createByProductId, createMultipleByProductId, fetchDishes, fetchDishById, updateByMeasureId, updateByProductId, deleteDish } from '../services/dishService';

export const createDishByProductId = async (req: Request, res: Response) => {
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

export const createDishByMeasureId = async (req: Request, res: Response) => {
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
  
export const getDishes = async (req: Request, res: Response) => {
  try {
    const mode = (req.query.mode as string) || 'full';
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

export const getDishById = async (req: Request, res: Response) => {
  try {
    const mode = (req.query.mode as string) || 'full';
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

export const updateDishByMeasureId = async (req: Request, res: Response) => {
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

export const updateDishByProductId = async (req: Request, res: Response) => {
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

export const deleteDishById = async (req: Request, res: Response) => {
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

export const createMultipleDishesByProductId = async (req: Request, res: Response) => {
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
