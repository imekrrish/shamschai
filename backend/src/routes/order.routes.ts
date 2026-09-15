import { Router } from 'express';
import { z } from 'zod';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

const orderItemSchema = z.object({
  title: z.string().min(1, 'Item title is required.'),
  size: z.string().min(1, 'Item size is required.'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative.'),
  quantity: z.number().int().min(1).max(20),
});

const newAddressSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required.'),
  phone: z.string().min(10, 'Valid phone number is required.'),
  streetAddress: z.string().min(3, 'Street address is required.'),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  postalCode: z.string().min(5, 'Postal/PIN code is required.'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional(),
  addressType: z.enum(['HOME', 'WORK', 'OTHER']).optional(),
});

const createOrderSchema = z.object({
  requestId: z.string().uuid(),
  items: z.array(orderItemSchema).min(1).max(3),
  shippingAddressId: z.string().uuid().optional(),
  newAddress: newAddressSchema.optional(),
  notes: z.string().max(1000).optional(),
  paymentMethod: z.literal('RAZORPAY').default('RAZORPAY'),
});

const cancelOrderSchema = z.object({
  notes: z.string().optional(),
});

// All order routes require authentication
router.use(authenticateToken);

router.post('/', validateBody(createOrderSchema), OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/pending-checkout', OrderController.getPendingCheckout);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/cancel', validateBody(cancelOrderSchema), OrderController.cancelOrder);

export default router;
