import prisma from '../src/config/prisma';

async function main() {
  console.log('Connecting to PostgreSQL database...');
  const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user;`;
  console.log('✅ Connection Successful! Details:');
  console.log(result);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Connection failed:', err);
  process.exit(1);
});
