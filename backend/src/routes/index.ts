import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import addressRoutes from './address.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import waitlistRoutes from './waitlist.routes';
import adminOrderRoutes from './admin-order.routes';
import productRoutes from './product.routes';
import locationRoutes from './location.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/products', productRoutes);
router.use('/locations', locationRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: "Sham's Chai API",
  });
});

export default router;
