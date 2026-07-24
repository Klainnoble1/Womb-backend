import { Router } from 'express';
import { getRentals, createRental } from './rentals.controller';
import { requireAuth, requireVendor } from '../auth/auth.middleware';

const router = Router();

router.get('/', getRentals);
router.post('/', requireAuth, requireVendor, createRental);

export default router;
