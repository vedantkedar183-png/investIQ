import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/recommendations', authenticate, aiController.getRecommendations);
router.get('/analyze/:symbol', authenticate, aiController.analyzeStock);

export default router;
