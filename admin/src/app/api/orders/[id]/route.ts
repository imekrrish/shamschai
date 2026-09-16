import { NextRequest, NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-api';
import { liveOrder } from '@/lib/live-orders';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(); if (denied) return denied;
  const order = await liveOrder(params.id);
  if (!order) {
    return NextResponse.json(
      { success: false, message: 'Order not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: order });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Order status is required' },
        { status: 400 }
      );
    }

    let changed;
    if (status === 'CANCELLED') {
      changed = await queryPostgres(
        'UPDATE orders SET status=$2, "paymentStatus"=\'REFUNDED\', "updatedAt"=NOW() WHERE id=$1 OR "orderNumber"=$1 RETURNING id',
        [params.id, status]
      );
      if (changed.length) {
        await queryPostgres(
          'UPDATE payments SET status=\'REFUNDED\', "updatedAt"=NOW() WHERE "orderId"=$1',
          [changed[0].id]
        );
      }
    } else {
      changed = await queryPostgres(
        'UPDATE orders SET status=$2, "updatedAt"=NOW() WHERE id=$1 OR "orderNumber"=$1 RETURNING id',
        [params.id, status]
      );
    }
    const updated = changed.length ? await liveOrder(changed[0].id) : null;

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
