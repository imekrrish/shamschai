import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const googleSchema = z.object({
  credential: z.string().min(1, 'Google credential is required.'),
});

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/google', validateBody(googleSchema), AuthController.googleAuth);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/verify-email/resend', authenticateToken, AuthController.resendVerification);

export default router;
