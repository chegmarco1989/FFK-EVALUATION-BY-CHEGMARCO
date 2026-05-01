/**
 * =============================================================================
 * VALIDATION SCHEMAS - ZOD VALIDATORS
 * =============================================================================
 * This file contains all Zod validation schemas for request validation.
 * Zod provides runtime type checking and generates TypeScript types.
 * 
 * 
 * - Zod is similar to Laravel's validation rules
 * - But it's type-safe and generates TypeScript types automatically
 * - Schemas can be composed and reused
 */

import { z } from 'zod';

// =============================================================================
// REUSABLE FIELD VALIDATORS
// =============================================================================
// These can be composed into larger schemas

/**
 * Email validator
 * Checks for valid email format
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase() // Normalize to lowercase
  .trim();

/**
 * Username validator
 * Alphanumeric with underscores, 3-30 characters
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores'
  )
  .trim();

/**
 * Password validator
 * For generated users: 6-10 characters (as per spec)
 * For real users: you'd want stronger requirements
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must not exceed 100 characters');

/**
 * Strong password validator (for production use)
 * Requires: min 8 chars, uppercase, lowercase, number, special char
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * ISO2 country code validator
 * Validates 2-letter country codes (FR, US, CI, etc.)
 */
export const countryCodeSchema = z
  .string()
  .length(2, 'Country code must be exactly 2 characters')
  .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters')
  .toUpperCase();

/**
 * URL validator
 * Validates HTTP/HTTPS URLs
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .startsWith('http', 'URL must start with http:// or https://');

/**
 * Role validator
 * Only allows 'admin' or 'user'
 */
export const roleSchema = z.enum(['admin', 'user'], {
  errorMap: () => ({ message: 'Role must be either "admin" or "user"' }),
});

/**
 * Date validator
 * Accepts ISO date strings and converts to Date object
 */
export const dateSchema = z
  .string()
  .datetime('Invalid date format, expected ISO 8601')
  .or(z.date())
  .transform((val) => (typeof val === 'string' ? new Date(val) : val));

/**
 * Phone number validator
 * Accepts various international formats
 */
export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 characters')
  .max(20, 'Phone number must not exceed 20 characters')
  .regex(
    /^[\d\s\-\+\(\)]+$/,
    'Phone number can only contain digits, spaces, hyphens, plus, and parentheses'
  );

// =============================================================================
// USER VALIDATION SCHEMAS
// =============================================================================

/**
 * Schema for generated user data (from Faker.js)
 * This validates the JSON file uploaded in batch import
 */
export const generatedUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  birthDate: z.string().datetime('Invalid birth date format'),
  city: z.string().min(1, 'City is required').max(100),
  country: countryCodeSchema,
  avatar: urlSchema,
  company: z.string().min(1, 'Company is required').max(100),
  jobPosition: z.string().min(1, 'Job position is required').max(100),
  mobile: phoneSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

/**
 * Schema for batch import array
 * Validates that uploaded file contains array of users
 */
export const batchImportSchema = z.array(generatedUserSchema).min(1, 'Array must contain at least one user');

/**
 * Schema for user creation
 * Used when creating individual users via API
 */
export const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  birthDate: dateSchema,
  city: z.string().min(1).max(100),
  country: countryCodeSchema,
  avatar: urlSchema,
  company: z.string().min(1).max(100),
  jobPosition: z.string().min(1).max(100),
  mobile: phoneSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.default('user'),
});

// =============================================================================
// AUTHENTICATION VALIDATION SCHEMAS
// =============================================================================

/**
 * Schema for login credentials
 * Username can be either email or username
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username/email must be at least 3 characters')
    .max(255, 'Username/email must not exceed 255 characters')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// =============================================================================
// QUERY PARAMETER VALIDATION SCHEMAS
// =============================================================================

/**
 * Schema for /api/users/generate query parameters
 * Validates the 'count' parameter
 */
export const generateUsersQuerySchema = z.object({
  count: z
    .string()
    .regex(/^\d+$/, 'Count must be a positive integer')
    .transform(Number)
    .refine((n) => n >= 1 && n <= 1000, {
      message: 'Count must be between 1 and 1000',
    }),
});

/**
 * Schema for username parameter in routes
 */
export const usernameParamSchema = z.object({
  username: usernameSchema,
});

// =============================================================================
// TYPE INFERENCE
// =============================================================================
// Extract TypeScript types from Zod schemas
// This ensures types stay in sync with validation rules

export type GeneratedUserInput = z.infer<typeof generatedUserSchema>;
export type BatchImportInput = z.infer<typeof batchImportSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateUsersQuery = z.infer<typeof generateUsersQuerySchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;
