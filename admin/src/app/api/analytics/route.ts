import { NextResponse } from 'next/server';
import { getPostgresAnalytics } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const analytics = await getPostgresAnalytics();
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error computing analytics from PostgreSQL:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to compute analytics from database' },
      { status: 500 }
    );
  }
}
