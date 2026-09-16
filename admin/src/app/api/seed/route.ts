import { NextResponse } from 'next/server';
import { seedPostgresDatabase } from '@/lib/db';

export async function POST() {
  try {
    const pgResult = await seedPostgresDatabase();

    if (!pgResult.success) {
      return NextResponse.json({
        success: false,
        message: pgResult.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL database seeded successfully with admin user, products, orders, and payments (admin@shamschai.com / admin@123)',
      postgresSeeded: true
    });
  } catch (error) {
    console.error('Error re-seeding data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset seed data' },
      { status: 500 }
    );
  }
}
