import { Router } from 'express';
import { portfolioController } from '../controllers/portfolioController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/summary', authenticate, portfolioController.getSummary);
router.post('/trade', authenticate, portfolioController.trade);
router.post('/topup', authenticate, portfolioController.topupCash);

export default router;
