import { Router } from 'express';
import { getInventoryOverview, updateStock } from './inventory.controller.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/', getInventoryOverview);
router.put('/:id/stock', updateStock);

export default router;
