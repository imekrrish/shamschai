import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { RegisterDTO, LoginDTO, UpdateProfileDTO, ChangePasswordDTO, AuthUser } from '../types';
import { createEmailToken, emailTemplates, mailService } from './mail.service';

export class AuthService {
  private static generateToken(user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN'; name: string }): string {
    const secret = process.env.JWT_SECRET!;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn }
    );
  }

  static async register(data: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      const error: any = new Error('A user with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const verification = createEmailToken();

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        phone: data.phone || null,
        emailVerificationTokenHash: verification.hash,
        emailVerificationExpiresAt: verification.expiresAt,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);

    void mailService.sendCustomerAndTeam(
      user.email,
      emailTemplates.verifyAccount(user.name, verification.token),
      emailTemplates.internal('New account created', [`${user.name} created an account.`, `Email: ${user.email}`]),
    );

    return {
      user,
      token,
    };
  }

  static async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.passwordHash) {
      const error: any = new Error('This account was registered using Google. Please sign in with Google.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async googleAuth(data: { credential: string }) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw Object.assign(new Error('Google sign-in is not configured.'), { statusCode: 503 });

    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: data.credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw Object.assign(new Error('Google could not verify this account.'), { statusCode: 401 });
    }

    const email = payload.email.toLowerCase();
    const existing = await prisma.user.findFirst({ where: { OR: [{ googleId: payload.sub }, { email }] } });
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { googleId: payload.sub, avatar: payload.picture || existing.avatar, emailVerifiedAt: existing.emailVerifiedAt || new Date() },
          select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, emailVerifiedAt: true, createdAt: true },
        })
      : await prisma.user.create({
          data: { email, name: payload.name || email.split('@')[0], avatar: payload.picture || null, googleId: payload.sub, emailVerifiedAt: new Date(), role: 'CUSTOMER' },
          select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, emailVerifiedAt: true, createdAt: true },
        });

    return { user, token: this.generateToken(user) };
  }

  static async verifyEmail(token: string) {
    const hash = createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({ where: { emailVerificationTokenHash: hash, emailVerificationExpiresAt: { gt: new Date() } } });
    if (!user) throw Object.assign(new Error('This verification link is invalid or has expired.'), { statusCode: 400 });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date(), emailVerificationTokenHash: null, emailVerificationExpiresAt: null } });
    void mailService.send(user.email, emailTemplates.welcomeVerified(user.name));
    return { message: 'Email verified successfully.' };
  }

  static async resendVerification(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });
    if (user.emailVerifiedAt) return { message: 'Email is already verified.' };
    const verification = createEmailToken();
    await prisma.user.update({ where: { id: userId }, data: { emailVerificationTokenHash: verification.hash, emailVerificationExpiresAt: verification.expiresAt } });
    void mailService.send(user.email, emailTemplates.verifyAccount(user.name, verification.token));
    return { message: 'A new verification email has been sent.' };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  static async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!user.passwordHash) {
      const error: any = new Error('This account was created with Google and does not use a password.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Current password is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully.' };
  }
}
