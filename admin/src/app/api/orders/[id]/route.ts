import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { OrderStatus, PaymentStatus } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = db.getOrderById(params.id);
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
  try {
    const body = await req.json();
    const { status, paymentStatus } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Order status is required' },
        { status: 400 }
      );
    }

    const updated = db.updateOrderStatus(
      params.id,
      status as OrderStatus,
      paymentStatus as PaymentStatus | undefined
    );

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
