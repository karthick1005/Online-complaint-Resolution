/**
 * Unified Prisma Client Configuration
 * 
 * This file provides a singleton instance of PrismaClient to prevent
 * multiple instances and connection pool exhaustion.
 * 
 * In development: Uses global variable to persist across hot reloads
 * In production: Creates single instance with optimized settings
 */

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  // Production: Create optimized instance
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal',
  });
} else {
  // Development: Prevent multiple instances during hot reload
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn', 'info'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.__prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
