import { Router } from 'express';
import { register, login, getMe, getDemoAccounts } from './auth.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/demo-accounts', getDemoAccounts);

export default router;
