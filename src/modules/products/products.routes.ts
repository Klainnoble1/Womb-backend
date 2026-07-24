import { Router } from 'express';
import { getProducts, getProductById, createProduct } from './products.controller';
import { requireAuth, requireVendor } from '../auth/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, requireVendor, createProduct);

export default router;
