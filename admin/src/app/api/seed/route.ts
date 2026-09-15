import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { seedPostgresDatabase } from '@/lib/db';

export async function POST() {
  try {
    // 1. Reset in-memory / cache store
    db.reset();

    // 2. Also seed the actual PostgreSQL database if available
    let pgResult: any = null;
    try {
      pgResult = await seedPostgresDatabase();
    } catch (e: any) {
      console.warn('Postgres seeding skipped or failed:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo database re-seeded successfully with products, orders, payments and admin credentials (admin@shamschai.com / admin@123)',
      postgresSeeded: pgResult?.success ?? false
    });
  } catch (error) {
    console.error('Error re-seeding data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset seed data' },
      { status: 500 }
    );
  }
}
