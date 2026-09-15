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
  return NextResponse.json({ success: false, message: 'Payment status is managed by Razorpay and cannot be edited here.' }, { status: 409 });
}
