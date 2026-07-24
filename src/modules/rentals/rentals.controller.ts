import { Request, Response } from 'express';
import { dbGetRentals, dbCreateRental } from '../../database/db';

export const getRentals = async (req: Request, res: Response) => {
  try {
    const rentals = await dbGetRentals();
    return res.json({ status: 'success', rentals });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch rentals' });
  }
};

export const createRental = async (req: Request, res: Response) => {
  try {
    const { item_name, category, daily_rate, image, location } = req.body;
    if (!item_name || !category || !daily_rate || !image) {
      return res.status(400).json({ error: 'Item name, category, daily rate, and image are required.' });
    }

    const rental = await dbCreateRental({
      item_name,
      category,
      daily_rate: Number(daily_rate),
      image,
      location: location || 'Lagos, Nigeria',
      available: true,
    });
    return res.status(201).json({ message: 'Rental item added successfully', rental });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to add rental item' });
  }
};
