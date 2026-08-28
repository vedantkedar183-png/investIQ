import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/transactions', authenticate, reportController.getTransactions);
router.post('/calculate/sip', reportController.calculateSIP);
router.post('/calculate/lumpsum', reportController.calculateLumpsum);

export default router;
