/**
 * Prisma Client Instance
 * Singleton pattern for database connection
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Test connection and connect
prisma.$connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => {
    console.log('⚠️ Database connection warming up (Neon auto-suspend)...');
    console.log('Retry your request in a few seconds');
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
