import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const analytics = db.getAnalytics();
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to compute analytics' },
      { status: 500 }
    );
  }
}
