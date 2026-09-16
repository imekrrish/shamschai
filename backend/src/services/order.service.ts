import { createHash, randomUUID } from 'node:crypto';
import { paymentError, priceItemsFromDb } from './payment-security';
import { razorpayConfig } from './razorpay-client';
import prisma from '../config/prisma';
import { CreateOrderDTO } from '../types';
import { PaymentService } from './payment.service';
import { PaymentStatus } from '@prisma/client';
import { emailTemplates, mailService } from './mail.service';

export class OrderService {
  static async getPendingCheckout(userId: string) {
    const latest = await prisma.order.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { items: true } });
    if (!latest || latest.status !== 'PENDING' || latest.paymentStatus !== 'PENDING' || latest.paymentMethod !== 'RAZORPAY') return null;
    const snapshot = latest.shippingSnapshot as Record<string, unknown>;
    return snapshot.checkoutFingerprint ? latest : null;
  }
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  static async createOrder(userId: string, data: CreateOrderDTO) {
    razorpayConfig();
    const items = await priceItemsFromDb(data.items);
    const order = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${data.requestId}))`;
      const delivery = data.shippingAddressId
        ? await tx.address.findFirst({ where: { id: data.shippingAddressId, userId } })
        : data.newAddress;
      if (!delivery) throw paymentError('Choose a valid delivery address.');
      if ((delivery.country || 'India').toLowerCase() !== 'india' || !/^[1-9][0-9]{5}$/.test(delivery.postalCode)) throw paymentError('Delivery is available to Indian PIN codes only.');
      const snapshot = { recipientName: delivery.recipientName, phone: delivery.phone, streetAddress: delivery.streetAddress, landmark: delivery.landmark || null, city: delivery.city, state: delivery.state, postalCode: delivery.postalCode, country: delivery.country || 'India' };
      const fingerprint = createHash('sha256').update(JSON.stringify({ items, address: snapshot, notes: data.notes || '' })).digest('hex');
      const existing = await tx.order.findUnique({ where: { id: data.requestId }, include: { items: true } });
      if (existing) {
        const saved = existing.shippingSnapshot as Record<string, unknown>;
        if (existing.userId !== userId || saved.checkoutFingerprint !== fingerprint) throw paymentError('Checkout request has changed. Please begin a new checkout.', 409);
        return existing;
      }
      const addressId = data.shippingAddressId || (await tx.address.create({ data: { ...data.newAddress!, userId } })).id;
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const shippingFee = subtotal >= 500 ? 0 : 50;
      return tx.order.create({ data: {
        id: data.requestId, orderNumber: this.generateOrderNumber(), userId,
        shippingAddressId: addressId,
        shippingSnapshot: { ...snapshot, checkoutFingerprint: fingerprint },
        subtotal, shippingFee, totalAmount: subtotal + shippingFee, currency: 'INR', paymentMethod: 'RAZORPAY', notes: data.notes,
        items: { create: items },
      }, include: { items: true } });
    }, { maxWait: 20000, timeout: 20000 });
    if (order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED' || order.status !== 'PENDING') return { order, paymentIntent: null };
    const paymentIntent = await PaymentService.initiateOrderPayment(order.id, userId);
    return { order, paymentIntent };
  }

  static async getUserOrders(userId: string, options?: { page?: number; limit?: number }) {
    const historyWhere = { userId, paymentStatus: { in: [PaymentStatus.PAID, PaymentStatus.REFUNDED] } };
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(50, Math.max(1, options?.limit || 10));
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: historyWhere,
        include: {
          items: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: historyWhere }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        totalOrders: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { userId, OR: [{ id: orderId }, { orderNumber: orderId }] },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      const error: any = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  static async cancelOrder(userId: string, orderId: string, notes?: string) {
    return prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${orderId}))`;
      const order = await tx.order.findFirst({ where: { id: orderId, userId } });
      if (!order) throw paymentError('Order not found.', 404);
      // An issued checkout can still capture after the browser closes. Route cancellation
      // through support until a provider-backed cancellation/refund workflow exists.
      const payment = await tx.payment.findFirst({ where: { orderId, provider: 'RAZORPAY' } });
      if (payment || order.paymentStatus === 'PAID') throw paymentError('Please contact customer care to cancel this order and arrange any refund.', 409);
      if (order.status !== 'PENDING') throw paymentError('This order cannot be cancelled online.', 409);
      const updated = await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', notes: notes ? (order.notes || '') + ' | Cancellation: ' + notes : order.notes }, include: { items: true } });
      return { message: 'Order cancelled.', order: updated };
    });
  }

  static async updateStatusAsAdmin(orderId: string, status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
    if (!order) throw paymentError('Order not found.', 404);
    if (order.status === status) return order;
    const updated = await prisma.order.update({ where: { id: orderId }, data: { status } });
    void mailService.sendCustomerAndTeam(
      order.user.email,
      emailTemplates.orderStatus(order.user.name, order.orderNumber, status),
      emailTemplates.internal('Order status updated', [`Order: ${order.orderNumber}`, `Status: ${order.status} -> ${status}`, `Customer: ${order.user.name} (${order.user.email})`]),
    );
    return updated;
  }
}
