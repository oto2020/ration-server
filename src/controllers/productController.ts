import { Request, Response } from 'express';
import {
  createNewProduct, 
  fetchProducts, 
  fetchProductById,
  fetchProductCategories,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../services/productService';

export const createProduct = async (req: Request, res: Response) => {
  console.log(`createProduct`);
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
    const mode = (req.query.mode as string) || 'full';
    const search = req.query.search as string;
    
    console.log(`getProducts ${mode} ${search}`);
    let products = search ? await searchProducts(search as string, mode) : await fetchProducts(mode);
    res.status(200).json(products);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};



export const getProductCategories = async (req: Request, res: Response) => {
  console.log(`getProductCategories`);
  try {
    let productCategories = await fetchProductCategories();
    res.status(200).json(productCategories);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};


export const getProductById = async (req: Request, res: Response) => {
  console.log(`getProductById`);
  try {
    const { id } = req.params;
    const mode = (req.query.mode as string) || 'full';
    const product = await fetchProductById(Number(id), mode);
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
};

export const updateProductById = async (req: Request, res: Response) => {
  console.log(`updateProductById`);
  try {
    const { id } = req.params;
    const productData = req.body;
    const updatedProduct = await updateProduct(Number(id), productData);
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const deleteProductById = async (req: Request, res: Response) => {
  console.log(`deleteProductById`);
  try {
    const { id } = req.params;
    await deleteProduct(Number(id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};