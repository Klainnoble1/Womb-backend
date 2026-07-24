import { Request, Response } from 'express';
import { dbCreateProfessional, dbGetProfessionals } from '../../database/db';

export const getProfessionals = async (req: Request, res: Response) => {
  try {
    const professionals = await dbGetProfessionals();
    return res.json({ status: 'success', professionals });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch professionals' });
  }
};

export const createProfessional = async (req: Request, res: Response) => {
  try {
    const { name, role, hourly_rate, avatar } = req.body;
    if (!name || !role || !hourly_rate || !avatar) {
      return res.status(400).json({ error: 'Name, role, hourly rate, and avatar are required.' });
    }

    const professional = await dbCreateProfessional({
      name,
      role,
      hourly_rate: Number(hourly_rate),
      avatar,
    });

    return res.status(201).json({ message: 'Professional profile published successfully', professional });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to publish professional profile' });
  }
};
