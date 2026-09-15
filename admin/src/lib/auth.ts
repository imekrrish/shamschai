import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from './types';
import { SEED_ADMIN } from './seed-data';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'shams_admin_token';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function signAdminToken(user: User): string {
  if (!JWT_SECRET) throw new Error('Admin JWT_SECRET is not configured.');
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAdminToken(token: string): JwtPayload | null {
  try {
    if (!JWT_SECRET) return null;
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function getCurrentAdmin(): JwtPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function authenticateAdmin(email: string, pass: string): User | null {
  const admin = SEED_ADMIN;
  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredEmail || !configuredPassword) return null;
  if (
    email.toLowerCase().trim() === configuredEmail.toLowerCase().trim() &&
    pass === configuredPassword
  ) {
    return {
      id: admin.id,
      email: configuredEmail,
      name: admin.name,
      role: admin.role,
      avatar: admin.avatar
    };
  }
  return null;
}
