import { NextResponse } from 'next/server';
import { checkPostgresStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await checkPostgresStatus();
    if (!status.connected) {
      return NextResponse.json({
        success: false,
        dataSource: 'PostgreSQL Database (Disconnected)',
        connected: false,
        message: 'Could not connect to PostgreSQL database. Please ensure PostgreSQL is running.'
      }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      dataSource: 'PostgreSQL Database (Direct Live Data)',
      database: status.database || null,
      host: process.env.DATABASE_URL?.includes('5433') ? '127.0.0.1:5433 (Local Postgres)' : 'Remote PostgreSQL',
      tableCounts: status.tableCounts || { users: 0, orders: 0, payments: 0, products: 0 },
      productsSource: 'PostgreSQL Database (products table)'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      dataSource: 'PostgreSQL Database (Disconnected)',
      message: error?.message || 'Postgres not reachable'
    }, { status: 503 });
  }
}
