import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.googleAuth(req.body);
      res.status(200).json({
        success: true,
        message: 'Google authentication successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, ...(await AuthService.verifyEmail(String(req.query.token || ''))) }); } catch (error) { next(error); }
  }

  static async resendVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, ...(await AuthService.resendVerification(req.user!.id)) }); } catch (error) { next(error); }
  }
}
