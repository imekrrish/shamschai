import prisma from '../config/prisma';
import { paymentError, validatePayment, verifySignature } from './payment-security';
import { razorpayConfig, razorpayRequest, RazorpayPayment } from './razorpay-client';
import { emailTemplates, mailService } from './mail.service';

export class PaymentService {
  static async initiateOrderPayment(orderId: string, userId: string) {
    const { keyId } = razorpayConfig();
    return prisma.$transaction(async tx => {
      // Serialize initiation and settlement across all backend instances.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${orderId}))`;
      const order = await tx.order.findFirst({ where: { id: orderId, userId } });
      if (!order) throw paymentError('Order not found.', 404);
      const snapshot = order.shippingSnapshot as Record<string, unknown>;
      if (order.paymentMethod !== 'RAZORPAY' || !snapshot.checkoutFingerprint) throw paymentError('Please create a new checkout for this legacy order.', 409);
      if (order.status !== 'PENDING' || order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED') throw paymentError('This order is no longer awaiting payment.', 409);
      let payment = await tx.payment.findFirst({ where: { orderId, provider: 'RAZORPAY' } });
      if (!payment) {
        const remote = await razorpayRequest<{ id: string; amount: number; currency: string }>('orders', {
          amount: Math.round(Number(order.totalAmount) * 100), currency: order.currency,
          receipt: order.id, partial_payment: false, notes: { merchant_order_id: order.id },
        });
        if (!/^order_[a-zA-Z0-9]+$/.test(remote.id)) throw paymentError('Invalid payment provider response.', 502);
        validatePayment({ ...remote, order_id: remote.id }, remote.id, Number(order.totalAmount), order.currency);
        payment = await tx.payment.create({ data: { orderId, userId, provider: 'RAZORPAY', transactionRef: remote.id, amount: order.totalAmount, currency: order.currency, status: 'PENDING' } });
      }
      return { keyId, razorpayOrderId: payment.transactionRef, amount: Math.round(Number(payment.amount) * 100), currency: payment.currency };
    }, { timeout: 20000, maxWait: 20000 });
  }

  static async verify(userId: string, data: { orderId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    const payment = await prisma.payment.findFirst({ where: { orderId: data.orderId, userId, provider: 'RAZORPAY', transactionRef: data.razorpay_order_id } });
    if (!payment) throw paymentError('Payment order not found.', 404);
    if (!verifySignature(payment.transactionRef + '|' + data.razorpay_payment_id, data.razorpay_signature, razorpayConfig().secret)) throw paymentError('Invalid payment signature.');
    await this.reconcile(data.razorpay_payment_id, payment.transactionRef);
    return this.getPaymentStatusForOrder(data.orderId, userId);
  }

  static async reconcile(paymentId: string, expectedOrder?: string) {
    if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId)) throw paymentError('Invalid payment ID.');
    const remote = await razorpayRequest<RazorpayPayment>('payments/' + paymentId);
    if (remote.id !== paymentId || !remote.order_id) throw paymentError('Invalid payment provider response.', 502);
    if (expectedOrder && remote.order_id !== expectedOrder) throw paymentError('Payment belongs to a different order.');
    const payment = await prisma.payment.findUnique({ where: { transactionRef: remote.order_id } });
    // Unknown orders may belong to another integration on this Razorpay account.
    if (!payment || payment.provider !== 'RAZORPAY') return;
    validatePayment(remote, payment.transactionRef, Number(payment.amount), payment.currency);
    const wasPaid = payment.status === 'PAID';
    const wasRefunded = payment.status === 'REFUNDED';
    const refunded = remote.status === 'refunded' && remote.amount_refunded === remote.amount;
    const captured = remote.status === 'captured' && remote.captured === true;
    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${payment.orderId}))`;
      const order = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId } });
      validatePayment(remote, payment.transactionRef, Number(order.totalAmount), order.currency);
      if ((!captured && !refunded) || order.paymentStatus === 'REFUNDED') return;
      const status = refunded ? 'REFUNDED' : 'PAID';
      await tx.payment.update({ where: { id: payment.id }, data: { status, metadata: { paymentId, amountRefunded: remote.amount_refunded || 0 } } });
      await tx.order.update({ where: { id: order.id }, data: {
        paymentStatus: status,
        // A late capture never reopens a cancelled or fulfilled order.
        ...(captured && order.status === 'PENDING' ? { status: 'CONFIRMED' } : {}),
      } });
    });
    if (captured && !wasPaid) {
      const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { user: true, items: true } });
      if (order) void mailService.sendCustomerAndTeam(
        order.user.email,
        emailTemplates.orderConfirmed(order.user.name, order),
        emailTemplates.internal('Payment received', [`Order: ${order.orderNumber}`, `Customer: ${order.user.name} (${order.user.email})`, `Amount: INR ${order.totalAmount}`]),
      );
    } else if (refunded && !wasRefunded) {
      const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { user: true } });
      if (order) void mailService.sendCustomerAndTeam(
        order.user.email,
        emailTemplates.orderStatus(order.user.name, order.orderNumber, 'REFUNDED'),
        emailTemplates.internal('Payment refunded', [`Order: ${order.orderNumber}`, `Customer: ${order.user.name} (${order.user.email})`]),
      );
    }
  }

  static async webhook(raw: Buffer, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw paymentError('Webhook is not configured.', 503);
    if (!Buffer.isBuffer(raw) || !verifySignature(raw, signature, secret)) throw paymentError('Invalid webhook signature.');
    let event: any;
    try { event = JSON.parse(raw.toString('utf8')); } catch { throw paymentError('Invalid webhook body.'); }
    if (!event || typeof event !== 'object' || typeof event.event !== 'string') throw paymentError('Invalid webhook event.');
    if (!['payment.captured', 'order.paid', 'refund.processed'].includes(event.event)) return;
    const paymentId = event.event === 'refund.processed' ? event.payload?.refund?.entity?.payment_id : event.payload?.payment?.entity?.id;
    if (typeof paymentId !== 'string') throw paymentError('Missing webhook payment ID.');
    // Re-fetch authoritative state: duplicate/out-of-order events are harmless.
    await this.reconcile(paymentId);
  }

  static async getPaymentStatusForOrder(orderId: string, userId: string, refresh = false) {
    let order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw paymentError('Order not found.', 404);
    if (refresh && order.paymentStatus === 'PENDING') {
      const payment = await prisma.payment.findFirst({ where: { orderId, provider: 'RAZORPAY' } });
      if (payment) {
        const remote = await razorpayRequest<{ items: RazorpayPayment[] }>('orders/' + payment.transactionRef + '/payments');
        const settled = remote.items.find(item => item.status === 'captured' || item.status === 'refunded');
        if (settled) {
          await this.reconcile(settled.id, payment.transactionRef);
          order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
        }
      }
    }
    return { orderId: order.id, orderNumber: order.orderNumber, orderStatus: order.status, paymentStatus: order.paymentStatus, totalAmount: order.totalAmount, currency: order.currency };
  }
}

