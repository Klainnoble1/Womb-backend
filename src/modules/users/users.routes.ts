import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { getDashboard } from './users.controller';

const router = Router();

router.get('/dashboard', requireAuth, getDashboard);

export default router;
