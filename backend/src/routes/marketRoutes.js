import { Router } from 'express';
import { marketController } from '../controllers/marketController.js';

const router = Router();

router.get('/indices', marketController.getIndices);
router.get('/search', marketController.search);
router.get('/asset/:symbol', marketController.getAssetDetails);
router.get('/history/:symbol', marketController.getHistoricalChart);

export default router;
