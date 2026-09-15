import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

// Public endpoints for storefront & admin
router.get('/', ProductController.getAll);
router.get('/:idOrSlug', ProductController.getByIdOrSlug);

// Product management endpoints
router.put('/:id', ProductController.update);
router.post('/', ProductController.create);
router.delete('/:id', ProductController.remove);

export default router;
