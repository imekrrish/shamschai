const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function test() {
  console.log('Testing Prisma with Local PostgreSQL (shamschai_dev)...');
  console.log('Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

  // 1. Query user count
  const count = await prisma.user.count();
  console.log('Current user count in local database:', count);

  // 2. Upsert a test customer
  const testUser = await prisma.user.upsert({
    where: { email: 'chai.master@shamschai.in' },
    update: {},
    create: {
      email: 'chai.master@shamschai.in',
      name: 'Shams Chai Master',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Successfully connected and verified user record in Local PostgreSQL:');
  console.log({ id: testUser.id, email: testUser.email, name: testUser.name });

  await prisma.$disconnect();
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
