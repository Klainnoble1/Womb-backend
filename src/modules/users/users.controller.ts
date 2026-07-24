import { Response } from 'express';
import { dbGetDashboardByEmail } from '../../database/db';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export const getDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dashboard = await dbGetDashboardByEmail(req.user!.email);
    return res.json({ status: 'success', ...dashboard });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load dashboard' });
  }
};
