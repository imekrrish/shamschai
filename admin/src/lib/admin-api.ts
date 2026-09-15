import { NextResponse } from 'next/server';
import { getCurrentAdmin } from './auth';

export function requireAdmin() {
  if (getCurrentAdmin()) return null;
  return NextResponse.json({ success: false, message: 'Admin sign-in required.' }, { status: 401 });
}

export const number = (value: unknown) => Number(value || 0);
