import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { PaymentStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const provider = searchParams.get('provider') || undefined;
    const search = searchParams.get('search') || undefined;

    const payments = db.getPayments({ status, provider, search });

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
  try {
    const body = await req.json();
    const { id, status, settlementStatus } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Payment ID and status are required' },
        { status: 400 }
      );
    }

    const updated = db.updatePaymentStatus(id, status as PaymentStatus, settlementStatus);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
