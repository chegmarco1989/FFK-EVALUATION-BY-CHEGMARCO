/**
 * =============================================================================
 * PRISMA CONFIGURATION (Prisma 7+)
 * =============================================================================
 * Configuration file for Prisma migrations and database connection.
 * In Prisma 7, the database URL is moved here instead of schema.prisma
 * 
 * This file is used by Prisma CLI for migrations.
 * The actual database connection in the app uses the adapter in database.ts
 */

/// <reference types="node" />

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
};
