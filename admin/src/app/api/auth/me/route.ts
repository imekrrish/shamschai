import { NextResponse } from 'next/server';
import { getCurrentAdmin, getAdminUserById } from '@/lib/auth';

export async function GET() {
  const jwtUser = getCurrentAdmin();
  if (!jwtUser) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const dbUser = await getAdminUserById(jwtUser.id);
  const user = dbUser || {
    id: jwtUser.id,
    email: jwtUser.email,
    name: jwtUser.name,
    role: jwtUser.role as any
  };

  return NextResponse.json({
    success: true,
    user
  });
}
