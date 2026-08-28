import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/guest-login', authController.guestLogin);
router.get('/profile', authenticate, authController.getProfile);
router.get('/me', authenticate, authController.getProfile);

export default router;
