import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});

// All user routes require authentication
router.use(authenticateToken);

router.get('/me', UserController.getProfile);
router.put('/me', validateBody(updateProfileSchema), UserController.updateProfile);
router.put('/me/password', validateBody(changePasswordSchema), UserController.changePassword);

export default router;
