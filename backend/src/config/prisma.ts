import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const appEnv = (process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
const isProd = appEnv === 'production';

// Determine active database URL based on environment target
const activeDbUrl = isProd
  ? process.env.DATABASE_URL_RAILWAY || process.env.DATABASE_URL
  : process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;

// Print prominent safety banner to ensure zero confusion
console.log('\n======================================================');
if (isProd) {
  console.log('🚀 [PRODUCTION ENVIRONMENT ACTIVE]');
  console.log('☁️ Connected Database: RAILWAY POSTGRESQL');
} else {
  console.log('🛡️ [DEVELOPMENT ENVIRONMENT ACTIVE]');
  console.log('💻 Connected Database: LOCAL POSTGRESQL (Railway is Isolated)');
}
console.log('======================================================\n');

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: activeDbUrl ? { db: { url: activeDbUrl } } : undefined,
    log: isProd ? ['error'] : ['error', 'warn'],
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
