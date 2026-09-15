import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { liveOrders } from '@/lib/live-orders';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await liveOrders(status, search);
    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
