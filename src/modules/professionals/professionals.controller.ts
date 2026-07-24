import { Request, Response } from 'express';
import { applyPlatformFee, dbCreateProfessional, dbGetProfessionals, getPlatformFeeBreakdownFromVendorAmount } from '../../database/db';

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

    const vendorAmount = Number(hourly_rate);
    const professional = await dbCreateProfessional({
      name,
      role,
      hourly_rate: applyPlatformFee(vendorAmount),
      avatar,
    });

    return res.status(201).json({
      message: 'Professional profile published successfully',
      professional,
      pricing: getPlatformFeeBreakdownFromVendorAmount(vendorAmount),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to publish professional profile' });
  }
};
