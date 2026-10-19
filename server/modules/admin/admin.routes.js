import { Router } from 'express';
import {
  getAdminStats,
  getAllOrdersAdmin,
  updateOrderStatus,
  getAdminCustomers
} from './admin.controller.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAdminCustomers);

export default router;
