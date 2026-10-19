import { Router } from 'express';
import { getAllUsers, getUserById, updateUserRole } from './users.controller.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', requireAdmin, getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', requireAdmin, updateUserRole);

export default router;
