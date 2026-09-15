import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public endpoints for storefront & admin
router.get('/', ProductController.getAll);
router.get('/:idOrSlug', ProductController.getByIdOrSlug);

// Product management endpoints
router.put('/:id', authenticateToken, requireAdmin, ProductController.update);
router.post('/', authenticateToken, requireAdmin, ProductController.create);
router.delete('/:id', authenticateToken, requireAdmin, ProductController.remove);

export default router;
