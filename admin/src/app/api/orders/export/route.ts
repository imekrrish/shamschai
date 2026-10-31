import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { liveOrders } from '@/lib/live-orders';
import { createOrdersWorkbook, parseOrderDateRange } from '@/lib/order-export';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(); if (denied) return denied;
  const params = new URL(req.url).searchParams;
  let range;
  try {
    range = parseOrderDateRange(params.get('from'), params.get('to'));
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
  }
  try {
    const orders = await liveOrders('CONFIRMED', undefined, range);
    if (!orders.length) {
      return NextResponse.json({ success: false, message: 'No confirmed orders found in this date range.' }, { status: 404 });
    }
    const buffer = await createOrdersWorkbook(orders);
    return new NextResponse(new Uint8Array(buffer), { headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="confirmed-orders_${params.get('from')}_to_${params.get('to')}.xlsx"`,
      'Cache-Control': 'private, no-store',
    } });
  } catch (error) {
    console.error('Error exporting confirmed orders:', error);
    return NextResponse.json({ success: false, message: 'Could not export orders. Please try again.' }, { status: 500 });
  }
}
