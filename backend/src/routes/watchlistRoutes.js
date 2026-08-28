import { Router } from 'express';
import { watchlistController } from '../controllers/watchlistController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, watchlistController.getWatchlist);
router.post('/toggle', authenticate, watchlistController.toggle);

export default router;
