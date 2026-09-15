import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { OrderService } from '../services/order.service';

export class OrderController {
  static async getPendingCheckout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: await OrderService.getPendingCheckout(req.user!.id) }); } catch (error) { next(error); }
  }
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await OrderService.createOrder(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Order created successfully. Ready for payment.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await OrderService.getUserOrders(userId, { page, limit });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const order = await OrderService.getOrderById(userId, req.params.id);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const notes = req.body?.notes;
      const result = await OrderService.cancelOrder(userId, req.params.id, notes);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.order,
      });
    } catch (error) {
      next(error);
    }
  }
}
