// src/controllers/rationController.ts
import { Request, Response } from 'express';
import { createRationByDishId, fetchRations, fetchRationById, updateRationById, deleteRationById } from '../services/rationService';

export const createRation = async (req: Request, res: Response) => {
  try {
    const rationData = req.body;
    const newRation = await createRationByDishId(rationData);
    res.status(201).json(newRation);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getRations = async (req: Request, res: Response) => {
  try {
    const rations = await fetchRations();
    res.status(200).json(rations);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getRationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ration = await fetchRationById(Number(id));
    if (!ration) {
      return res.status(404).json({ error: 'Ration not found' });
    }
    res.status(200).json(ration);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const updateRation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rationData = req.body;
    const updatedRation = await updateRationById(Number(id), rationData);
    res.status(200).json(updatedRation);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const deleteRation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteRationById(Number(id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};
