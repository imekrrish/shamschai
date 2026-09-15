import { Router } from 'express';
import { joinWaitlist, getWaitlist } from '../controllers/waitlist.controller';

import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', joinWaitlist);
router.get('/', authenticateToken, requireAdmin, getWaitlist);

export default router;
