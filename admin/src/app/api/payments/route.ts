import { NextRequest, NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';
import { requireAdmin, number } from '@/lib/admin-api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const provider = searchParams.get('provider') || undefined;
    const search = searchParams.get('search') || undefined;

    const terms: string[] = []; const values: string[] = [];
    if (status) { values.push(status); terms.push(`p.status=$${values.length}`); }
    if (provider) { values.push(provider); terms.push(`p.provider=$${values.length}`); }
    if (search) { values.push(`%${search}%`); terms.push(`(p."transactionRef" ILIKE $${values.length} OR o."orderNumber" ILIKE $${values.length} OR u.name ILIKE $${values.length})`); }
    const payments = (await queryPostgres(`SELECT p.*, o."orderNumber", u.name AS "customerName", u.email AS "customerEmail" FROM payments p JOIN orders o ON o.id=p."orderId" JOIN users u ON u.id=p."userId" ${terms.length ? `WHERE ${terms.join(' AND ')}` : ''} ORDER BY p."createdAt" DESC`, values)).map((payment: any) => ({ ...payment, amount: number(payment.amount), settlementStatus: payment.status === 'PAID' ? 'SETTLED' : payment.status === 'REFUNDED' ? 'REFUNDED' : 'PENDING_SETTLEMENT' }));

    // Compute metrics
    const totalCollected = payments
      .filter(p => p.status === 'PAID')
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingAmount = payments
      .filter(p => p.status === 'PENDING')
      .reduce((acc, p) => acc + p.amount, 0);

    const refundedAmount = payments
      .filter(p => p.status === 'REFUNDED')
      .reduce((acc, p) => acc + p.amount, 0);

    return NextResponse.json({
      success: true,
      count: payments.length,
      summary: {
        totalCollected,
        pendingAmount,
        refundedAmount,
        totalTransactions: payments.length
      },
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Payment id and status are required' },
        { status: 400 }
      );
    }

    const updatedRows = await queryPostgres(
      `UPDATE payments 
       SET status = $2, "updatedAt" = NOW() 
       WHERE id = $1 OR "transactionRef" = $1 
       RETURNING *`,
      [id, status]
    );

    if (!updatedRows.length) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = updatedRows[0];

    // If payment was marked PAID or REFUNDED, sync the associated order's paymentStatus
    if (payment.orderId) {
      if (status === 'REFUNDED') {
        await queryPostgres(
          `UPDATE orders SET "paymentStatus" = 'REFUNDED', "updatedAt" = NOW() WHERE id = $1`,
          [payment.orderId]
        );
      } else if (status === 'PAID') {
        await queryPostgres(
          `UPDATE orders SET "paymentStatus" = 'PAID', "updatedAt" = NOW() WHERE id = $1`,
          [payment.orderId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: {
        ...payment,
        amount: number(payment.amount),
        settlementStatus: payment.status === 'PAID' ? 'SETTLED' : payment.status === 'REFUNDED' ? 'REFUNDED' : 'PENDING_SETTLEMENT'
      }
    });
  } catch (error: any) {
    console.error('Error updating payment in PostgreSQL:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update payment' },
      { status: 500 }
    );
  }
}
