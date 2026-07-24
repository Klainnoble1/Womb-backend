import { Router } from 'express';
import { getProfessionals, createProfessional } from './professionals.controller';
import { requireAuth, requireVendor } from '../auth/auth.middleware';

const router = Router();

router.get('/', getProfessionals);
router.post('/', requireAuth, requireVendor, createProfessional);

export default router;
