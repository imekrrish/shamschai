import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { updateOrderStatus } from '../controllers/admin-order.controller';

const router = Router();
router.use(authenticateToken, requireAdmin);
router.patch('/:id/status', validateBody(z.object({ status: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) })), updateOrderStatus);
export default router;