/**
 * =============================================================================
 * DATABASE CONNECTION - PRISMA CLIENT SINGLETON
 * =============================================================================
 * This module provides a singleton instance of Prisma Client.
 * Using a singleton prevents creating multiple database connections,
 * which would exhaust connection pools and cause performance issues.
 * 
 * 
 * - PrismaClient is like Laravel's DB facade or Eloquent
 * - It provides type-safe database queries
 * - The singleton pattern ensures only one connection pool exists
 */

import { PrismaClient, Prisma } from '@prisma/client';
import config from './environment';

/**
 * Global type augmentation for PrismaClient
 * This allows us to store the client on the global object in development
 * to prevent hot-reload from creating multiple instances
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client configuration options
 */
const prismaOptions: Prisma.PrismaClientOptions = {
  // Log queries in development for debugging
  log: config.isDevelopment()
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  
  // Error formatting
  errorFormat: 'pretty',
};

/**
 * Create or retrieve Prisma Client singleton
 * 
 * In development:
 * - Store client on global object to survive hot-reloads
 * - This prevents "too many clients" errors during development
 * 
 * In production:
 * - Create a single client instance
 * - No need for global storage as there are no hot-reloads
 */
export const prisma =
  global.prisma ||
  new PrismaClient(prismaOptions);

// In development, store client globally for hot-reload persistence
if (config.isDevelopment()) {
  global.prisma = prisma;
}

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed when app terminates
 * This prevents connection leaks and ensures clean shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
}

/**
 * Database health check
 * Verifies that database connection is working
 * Useful for health check endpoints and startup validation
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Execute a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Initialize database
 * Runs migrations and seeds if needed
 * Call this on application startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if database is accessible
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }
    
    console.log('✅ Database connection established');
    
    // In development, log database statistics
    if (config.isDevelopment()) {
      const userCount = await prisma.user.count();
      console.log(`   Users in database: ${userCount}`);
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// =============================================================================
// PRISMA CLIENT EXTENSIONS (Advanced Features)
// =============================================================================

/**
 * Extended Prisma Client with custom methods
 * This demonstrates how to add custom functionality to Prisma
 * 
 * Example usage:
 *   const user = await prisma.user.findByEmailOrUsername('john@example.com');
 */
export const prismaExtended = prisma.$extends({
  model: {
    user: {
      /**
       * Find user by email OR username
       * Common operation for login functionality
       */
      async findByEmailOrUsername(identifier: string) {
        return prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier },
            ],
          },
        });
      },
      
      /**
       * Find user and exclude password field
       * Safe method for retrieving user profiles
       */
      async findSafeById(id: number) {
        return prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthDate: true,
            city: true,
            country: true,
            avatar: true,
            company: true,
            jobPosition: true,
            mobile: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            // password: false (excluded by not selecting it)
          },
        });
      },
    },
  },
});

export default prisma;
