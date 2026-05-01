/**
 * =============================================================================
 * ENVIRONMENT CONFIGURATION
 * =============================================================================
 * This module loads and validates environment variables from .env file.
 * It ensures all required configuration is present before the app starts,
 * preventing runtime errors due to missing config.
 * 
 * 
 * - This is similar to Laravel's config files and env() helper
 * - dotenv loads .env file (like Laravel's Dotenv)
 * - We validate and type-cast values for type safety
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
// This must happen BEFORE any other imports that use process.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Parse a string value to boolean
 * Handles common boolean representations
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse a string value to number
 * Throws error if value is not a valid number
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number value: ${value}`);
  }
  return parsed;
}

/**
 * Get required environment variable
 * Throws error if variable is not set
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable with default value
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// =============================================================================
// ENVIRONMENT CONFIGURATION OBJECT
// =============================================================================
// This object provides type-safe access to all environment variables
// All values are validated and parsed to correct types

export const config = {
  // Server Configuration
  port: parseNumber(process.env.PORT, 9090),
  nodeEnv: getOptionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  
  // Database Configuration
  database: {
    url: getRequiredEnv('DATABASE_URL'),
  },
  
  // JWT Configuration
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    expiresIn: getOptionalEnv('JWT_EXPIRES_IN', '24h'),
  },
  
  // Security Configuration
  security: {
    // Rate limiting for authentication endpoint
    rateLimit: {
      maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 5),
      windowMinutes: parseNumber(process.env.RATE_LIMIT_WINDOW_MINUTES, 15),
    },
    
    // CORS configuration
    cors: {
      // Split comma-separated origins into array
      origins: getOptionalEnv('CORS_ORIGIN', 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim()),
    },
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 10485760), // 10MB default
    allowedTypes: getOptionalEnv('ALLOWED_FILE_TYPES', 'application/json')
      .split(',')
      .map((type) => type.trim()),
  },
  
  // Logging Configuration
  logging: {
    level: getOptionalEnv('LOG_LEVEL', 'info') as 'error' | 'warn' | 'info' | 'debug',
    enableRequestLogging: parseBoolean(process.env.ENABLE_REQUEST_LOGGING, true),
  },
  
  // Helper methods
  isDevelopment: (): boolean => {
    return config.nodeEnv === 'development';
  },
  
  isProduction: (): boolean => {
    return config.nodeEnv === 'production';
  },
  
  isTest: (): boolean => {
    return config.nodeEnv === 'test';
  },
} as const; // 'as const' makes this object readonly

// =============================================================================
// CONFIGURATION VALIDATION
// =============================================================================
// Validate critical configuration on startup

/**
 * Validate that all required configuration is present and valid
 * This runs immediately when the module is imported
 */
function validateConfig(): void {
  const errors: string[] = [];
  
  // Validate JWT secret strength
  if (config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security');
  }
  
  // Validate port range
  if (config.port < 1 || config.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }
  
  // Validate rate limit values
  if (config.security.rateLimit.maxRequests < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be at least 1');
  }
  
  if (config.security.rateLimit.windowMinutes < 1) {
    errors.push('RATE_LIMIT_WINDOW_MINUTES must be at least 1');
  }
  
  // Validate file size
  if (config.upload.maxFileSize < 1) {
    errors.push('MAX_FILE_SIZE must be at least 1 byte');
  }
  
  // If any validation errors, throw and prevent app startup
  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}

// Run validation immediately
validateConfig();

// Log configuration in development (but hide secrets!)
if (config.isDevelopment()) {
  console.log('✅ Configuration loaded successfully');
  console.log(`   Port: ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Database: ${config.database.url}`);
  console.log(`   JWT Expiration: ${config.jwt.expiresIn}`);
  console.log(`   CORS Origins: ${config.security.cors.origins.join(', ')}`);
}

export default config;
