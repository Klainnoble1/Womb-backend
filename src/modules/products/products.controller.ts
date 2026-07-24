import { Request, Response } from 'express';
import { dbGetProducts, dbGetProductById, dbCreateProduct } from '../../database/db';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const products = await dbGetProducts({
      category: category as string,
      search: search as string,
    });
    return res.json({ status: 'success', count: products.length, products });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await dbGetProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ status: 'success', product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch product' });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, price, image, description, brand, stock, vendor_id } = req.body;
    if (!name || !category || !price || !image) {
      return res.status(400).json({ error: 'Name, category, price, and image are required.' });
    }
    const product = await dbCreateProduct({
      vendor_id: Number(req.user?.id) || Number(vendor_id) || 1,
      name,
      category,
      price: Number(price),
      image,
      description: description || '',
      brand: brand || 'Womb Partner',
      stock: Number(stock) || 10,
    });
    return res.status(201).json({ message: 'Product created successfully', product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create product' });
  }
};
