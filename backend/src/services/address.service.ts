import prisma from '../config/prisma';
import { CreateAddressDTO, UpdateAddressDTO } from '../types';

export class AddressService {
  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async getAddressById(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      const error: any = new Error('Address not found.');
      error.statusCode = 404;
      throw error;
    }

    return address;
  }

  static async createAddress(userId: string, data: CreateAddressDTO) {
    // Count existing addresses to decide default flag if not explicitly set
    const count = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = data.isDefault || count === 0;

    return prisma.$transaction(async tx => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          recipientName: data.recipientName,
          phone: data.phone,
          streetAddress: data.streetAddress,
          landmark: data.landmark || null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country || 'India',
          isDefault: shouldBeDefault,
          addressType: data.addressType || 'HOME',
        },
      });
    });
  }

  static async updateAddress(userId: string, addressId: string, data: UpdateAddressDTO) {
    await this.getAddressById(userId, addressId);

    return prisma.$transaction(async tx => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(data.recipientName && { recipientName: data.recipientName }),
          ...(data.phone && { phone: data.phone }),
          ...(data.streetAddress && { streetAddress: data.streetAddress }),
          ...(data.landmark !== undefined && { landmark: data.landmark }),
          ...(data.city && { city: data.city }),
          ...(data.state && { state: data.state }),
          ...(data.postalCode && { postalCode: data.postalCode }),
          ...(data.country && { country: data.country }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          ...(data.addressType && { addressType: data.addressType }),
        },
      });
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    const existing = await this.getAddressById(userId, addressId);

    return prisma.$transaction(async tx => {
      await tx.address.delete({ where: { id: addressId } });

      // If the deleted address was default, set the latest remaining as default
      if (existing.isDefault) {
        const nextDefault = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (nextDefault) {
          await tx.address.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }

      return { message: 'Address removed successfully.' };
    });
  }

  static async setDefaultAddress(userId: string, addressId: string) {
    await this.getAddressById(userId, addressId);

    return prisma.$transaction(async tx => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      return tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }
}
