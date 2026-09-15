import { NextResponse } from 'next/server';
import { checkPostgresStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await checkPostgresStatus();
    return NextResponse.json({
      success: true,
      dataSource: status.connected ? 'PostgreSQL Database' : 'Serverless Demo Store',
      database: status.database || null,
      host: process.env.DATABASE_URL ? '127.0.0.1:5433 (Local Postgres)' : 'In-Memory / Standalone',
      tableCounts: status.tableCounts || { users: 1, orders: 6, payments: 6 },
      productsSource: 'src/data/products.ts & In-Memory Store'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      dataSource: 'Serverless Demo Store',
      message: 'Postgres not reachable'
    });
  }
}
