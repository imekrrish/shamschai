import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AddressService } from '../services/address.service';

export class AddressController {
  static async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const addresses = await AddressService.getAddresses(req.user!.id);
      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAddressById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await AddressService.getAddressById(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await AddressService.createAddress(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Address added successfully.',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AddressService.updateAddress(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Address updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AddressService.deleteAddress(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async setDefaultAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AddressService.setDefaultAddress(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Default address updated.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
