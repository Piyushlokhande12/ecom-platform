import { Router } from 'express';
import {
  getAdminStats,
  getAllOrdersAdmin,
  updateOrderStatus
} from './orders.controller.js';
import { getAllUsers } from '../users/users.controller.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllUsers);

export default router;
