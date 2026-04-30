/**
 * =============================================================================
 * TYPE DEFINITIONS - CENTRAL TYPE REGISTRY
 * =============================================================================
 * This file contains all TypeScript interfaces and types used throughout
 * the application. Centralizing types here ensures consistency and makes
 * refactoring easier.
 * 
 * For developers coming from PHP/Laravel:
 * - Interfaces are like PHP interfaces but also describe object shapes
 * - Types can be unions, intersections, or aliases
 * - The "?" makes properties optional (like nullable in PHP)
 */

import { Request } from 'express';

// =============================================================================
// USER TYPES
// =============================================================================

/**
 * Complete user object as stored in database
 * This matches the Prisma User model exactly
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
  city: string;
  country: string;
  avatar: string;
  company: string;
  jobPosition: string;
  mobile: string;
  username: string;
  email: string;
  password: string; // Hashed password (never plain text!)
  role: 'admin' | 'user'; // Union type - only these two values allowed
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data for creation (without auto-generated fields)
 * Used when inserting new users into database
 */
export interface UserCreateInput {
  firstName: string;
  lastName: string;
  birthDate: Date | string; // Accept both Date objects and ISO strings
  city: string;
  country: string;
  avatar: string;
  company: string;
  jobPosition: string;
  mobile: string;
  username: string;
  email: string;
  password: string; // Will be hashed before storage
  role: 'admin' | 'user';
}

/**
 * User profile without sensitive data
 * Used for API responses - NEVER expose password hashes!
 */
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
  city: string;
  country: string;
  avatar: string;
  company: string;
  jobPosition: string;
  mobile: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generated user data from Faker.js
 * This is the format of the JSON file users download
 */
export interface GeneratedUser {
  firstName: string;
  lastName: string;
  birthDate: string; // ISO date string
  city: string;
  country: string; // ISO2 code (FR, US, CI, etc.)
  avatar: string; // URL to avatar image
  company: string;
  jobPosition: string;
  mobile: string;
  username: string;
  email: string;
  password: string; // Plain text password (only in generated JSON!)
  role: 'admin' | 'user';
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

/**
 * Login credentials submitted by user
 */
export interface LoginCredentials {
  username: string; // Can be email OR username
  password: string;
}

/**
 * JWT payload - data encoded in the token
 * Keep this minimal to reduce token size
 */
export interface JwtPayload {
  email: string;
  username: string;
  role: 'admin' | 'user';
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration (timestamp)
}

/**
 * Authentication response returned to client
 */
export interface AuthResponse {
  accessToken: string;
}

/**
 * Extended Express Request with authenticated user
 * This is what you get after the auth middleware runs
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload; // User data extracted from JWT
}

// =============================================================================
// BATCH IMPORT TYPES
// =============================================================================

/**
 * Result of a single user import attempt
 */
export interface ImportResult {
  success: boolean;
  index: number; // Position in the uploaded array
  reason?: string; // Error message if failed
}

/**
 * Summary of batch import operation
 */
export interface BatchImportSummary {
  total: number; // Total users in uploaded file
  imported: number; // Successfully imported
  skipped: number; // Skipped due to duplicates or errors
  errors: Array<{
    index: number;
    reason: string;
  }>;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standard success response wrapper
 * Provides consistent API response format
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard error response wrapper
 * Provides consistent error format across all endpoints
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // Machine-readable error code (e.g., "DUPLICATE_EMAIL")
    message: string; // Human-readable error message
    details?: unknown; // Additional error context (validation errors, etc.)
  };
}

/**
 * Validation error details
 * Used when request data fails validation
 */
export interface ValidationError {
  field: string; // Which field failed validation
  message: string; // What went wrong
  value?: unknown; // The invalid value (optional)
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make all properties of T optional recursively
 * Useful for partial updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract only the keys of T that have values of type V
 * Example: KeysOfType<User, string> = 'firstName' | 'lastName' | ...
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Omit password from User type
 * Utility type for safe user data handling
 */
export type SafeUser = Omit<User, 'password'>;

// =============================================================================
// ENVIRONMENT VARIABLES TYPE
// =============================================================================

/**
 * Type-safe environment variables
 * Ensures all required env vars are present and correctly typed
 */
export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  RATE_LIMIT_MAX_REQUESTS: number;
  RATE_LIMIT_WINDOW_MINUTES: number;
  CORS_ORIGIN: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  ENABLE_REQUEST_LOGGING: boolean;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid User object
 * Type guards help TypeScript narrow types at runtime
 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'username' in value
  );
}

/**
 * Type guard to check if a value is a valid JwtPayload
 */
export function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'email' in value &&
    'username' in value &&
    'role' in value
  );
}
