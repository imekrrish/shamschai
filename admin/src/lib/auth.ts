import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { User } from './types';
import { queryPostgres, getDbPool } from './db';

// A fallback here would be published with the repository, and anyone holding
// it could mint a valid admin session.
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

export async function authenticateAdmin(email: string, pass: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();
  const pool = getDbPool();
  if (!pool) {
    throw new Error('Database connection is not configured');
  }

  let rows = await queryPostgres<{
    id: string;
    email: string;
    passwordHash: string | null;
    name: string;
    role: string;
    avatar: string | null;
  }>('SELECT id, email, "passwordHash", name, role, avatar FROM users WHERE LOWER(email) = $1', [cleanEmail]);

  const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@shamschai.com').toLowerCase().trim();
  const configuredPassword = (process.env.ADMIN_PASSWORD || '').trim();
  const canBootstrap = configuredPassword.length > 0;

  // Create the admin on first sign-in, but only against a configured password.
  if (canBootstrap && rows.length === 0 && cleanEmail === configuredEmail && pass === configuredPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(configuredPassword, salt);
    const adminId = 'usr_admin_shams';
    await queryPostgres(
      `INSERT INTO users (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET "passwordHash" = $3, role = $5`,
      [adminId, configuredEmail, passwordHash, 'Sham Admin', 'ADMIN']
    );
    rows = await queryPostgres('SELECT id, email, "passwordHash", name, role, avatar FROM users WHERE LOWER(email) = $1', [cleanEmail]);
  }

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  if (user.role !== 'ADMIN') {
    return null;
  }

  if (!user.passwordHash) {
    return null;
  }

  const matches = await bcrypt.compare(pass, user.passwordHash);
  if (!matches) {
    // Re-hash only when ADMIN_PASSWORD was deliberately rotated in the
    // environment; without it a stale hash is simply a failed sign-in.
    if (canBootstrap && cleanEmail === configuredEmail && pass === configuredPassword) {
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(configuredPassword, salt);
      await queryPostgres('UPDATE users SET "passwordHash" = $1 WHERE id = $2', [newHash, user.id]);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        avatar: user.avatar || undefined
      };
    }
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any,
    avatar: user.avatar || undefined
  };
}

export async function getAdminUserById(id: string): Promise<User | null> {
  try {
    const rows = await queryPostgres<{
      id: string;
      email: string;
      name: string;
      role: string;
      avatar: string | null;
    }>('SELECT id, email, name, role, avatar FROM users WHERE id = $1 AND role = $2', [id, 'ADMIN']);
    if (rows.length === 0) return null;
    return {
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name,
      role: rows[0].role as any,
      avatar: rows[0].avatar || undefined
    };
  } catch {
    return null;
  }
}

