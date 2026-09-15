import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { OrderService } from '../services/order.service';

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const order = await OrderService.updateStatusAsAdmin(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
}