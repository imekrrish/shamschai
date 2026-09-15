import { Response, NextFunction, Request } from 'express';
import { AuthenticatedRequest } from '../types';
import { PaymentService } from '../services/payment.service';
export class PaymentController {
  static async verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await PaymentService.verify(req.user!.id, req.body) }); } catch (error) { next(error); }
  }
  static async retry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await PaymentService.initiateOrderPayment(req.body.orderId, req.user!.id) }); } catch (error) { next(error); }
  }
  static async getPaymentStatusForOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await PaymentService.getPaymentStatusForOrder(req.params.orderId, req.user!.id, true) }); } catch (error) { next(error); }
  }
  static async webhook(req: Request, res: Response, next: NextFunction) {
    try { await PaymentService.webhook(req.body, req.get('X-Razorpay-Signature') || ''); res.json({ received: true }); } catch (error) { next(error); }
  }
}

