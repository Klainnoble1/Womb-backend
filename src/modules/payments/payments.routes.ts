import { Router } from 'express';
import { initializePayment, verifyPayment } from './payments.controller';

const router = Router();

router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);

export default router;