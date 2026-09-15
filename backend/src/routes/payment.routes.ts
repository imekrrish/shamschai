import { Router } from 'express';
import { z } from 'zod';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
const router = Router();
router.use(authenticateToken);
router.post('/verify', validateBody(z.object({
  orderId: z.string().uuid(), razorpay_order_id: z.string().regex(/^order_[a-zA-Z0-9]+$/),
  razorpay_payment_id: z.string().regex(/^pay_[a-zA-Z0-9]+$/), razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
})), PaymentController.verify);
router.post('/retry', validateBody(z.object({ orderId: z.string().uuid() })), PaymentController.retry);
router.get('/order/:orderId', PaymentController.getPaymentStatusForOrder);
export default router;

