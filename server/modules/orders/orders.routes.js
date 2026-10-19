import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
  getAdminStats
} from './orders.controller.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

// Admin-specific order management routes
router.get('/admin/all', requireAdmin, getAllOrdersAdmin);
router.put('/admin/:id/status', requireAdmin, updateOrderStatus);
router.get('/admin/stats', requireAdmin, getAdminStats);

export default router;
