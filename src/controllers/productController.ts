import { Request, Response } from 'express';
import { createNewProduct, fetchProducts, fetchProductsMainFields, searchProductsMainFields } from '../services/productService';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const newProduct = await createNewProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { mode, search } = req.query;

    let products;
    if (mode === "mainFields") {
      products = search ? await searchProductsMainFields(search as string) : await fetchProductsMainFields();
    } else {
      products = await fetchProducts();
    }

    res.status(200).json(products);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};
