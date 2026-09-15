import { Router } from 'express';
import { z } from 'zod';
import { AddressController } from '../controllers/address.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

const createAddressSchema = z.object({
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

const updateAddressSchema = createAddressSchema.partial();

// All address routes require authentication
router.use(authenticateToken);

router.get('/', AddressController.getAddresses);
router.post('/', validateBody(createAddressSchema), AddressController.createAddress);
router.get('/:id', AddressController.getAddressById);
router.put('/:id', validateBody(updateAddressSchema), AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);
router.patch('/:id/default', AddressController.setDefaultAddress);

export default router;
