/**
 * =============================================================================
 * USER SERVICE - BUSINESS LOGIC LAYER
 * =============================================================================
 * This service contains all business logic related to user management.
 * It sits between controllers and the database, handling data transformation,
 * validation, and complex operations.
 * 
 * 
 * - Similar to Laravel's Service classes or Repository pattern
 * - Controllers call services, services call database
 * - Keeps controllers thin and focused on HTTP concerns
 * - Makes business logic reusable and testable
 */

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import {
  GeneratedUser,
  UserCreateInput,
  UserProfile,
  BatchImportSummary,
} from '../types/index';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/error.middleware';

/**
 * Number of bcrypt salt rounds
 * Higher = more secure but slower
 * 10 is a good balance for production
 */
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generate realistic fake users using Faker.js
 * Creates users with realistic data - no generic "test" or "example" values
 * 
 * @param count - Number of users to generate
 * @returns Array of generated users with plain text passwords
 */
export async function generateFakeUsers(count: number): Promise<GeneratedUser[]> {
  logger.info(`Generating ${count} fake users`);
  
  const users: GeneratedUser[] = [];
  
  // Generate unique emails and usernames to avoid duplicates
  const usedEmails = new Set<string>();
  const usedUsernames = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    // Generate unique email
    let email: string;
    do {
      email = faker.internet.email().toLowerCase();
    } while (usedEmails.has(email));
    usedEmails.add(email);
    
    // Generate unique username
    let username: string;
    do {
      username = faker.internet.userName().toLowerCase();
    } while (usedUsernames.has(username));
    usedUsernames.add(username);
    
    // Generate realistic user data
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const user: GeneratedUser = {
      firstName,
      lastName,
      
      // Birth date between 18 and 70 years ago
      birthDate: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }).toISOString(),
      
      // Real city and country
      city: faker.location.city(),
      country: faker.location.countryCode('alpha-2'), // ISO2 code (FR, US, CI, etc.)
      
      // Avatar URL using DiceBear API (generates consistent avatars based on seed)
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      
      // Professional information
      company: faker.company.name(),
      jobPosition: faker.person.jobTitle(),
      
      // Formatted phone number
      mobile: faker.phone.number(),
      
      // Credentials
      username,
      email,
      
      // Random password between 6 and 10 characters (as per spec)
      // NOTE: This is in PLAIN TEXT in the generated JSON (as required)
      // It will be hashed when imported to database
      password: faker.internet.password({ length: faker.number.int({ min: 6, max: 10 }) }),
      
      // Random role with 20% chance of being admin
      role: faker.helpers.arrayElement(['admin', 'user', 'user', 'user', 'user']) as 'admin' | 'user',
    };
    
    users.push(user);
  }
  
  logger.info(`Successfully generated ${users.length} fake users`);
  return users;
}

/**
 * Hash a plain text password using bcrypt
 * 
 * @param plainPassword - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare plain text password with hashed password
 * 
 * @param plainPassword - Plain text password from login attempt
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Create a single user in database
 * Hashes password before storage
 * 
 * @param userData - User data to create
 * @returns Created user (without password)
 */
export async function createUser(userData: UserCreateInput): Promise<UserProfile> {
  logger.debug('Creating user', { email: userData.email, username: userData.username });
  
  // Hash password before storing
  const hashedPassword = await hashPassword(userData.password);
  
  // Convert birthDate to Date object if it's a string
  const birthDate = typeof userData.birthDate === 'string'
    ? new Date(userData.birthDate)
    : userData.birthDate;
  
  // Create user in database
  const user = await prisma.user.create({
    data: {
      ...userData,
      birthDate,
      password: hashedPassword,
    },
    // Exclude password from returned data
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
    },
  });
  
  logger.info('User created successfully', { id: user.id, username: user.username });
  return user;
}

/**
 * Batch import users from generated JSON
 * Handles duplicates gracefully and returns detailed summary
 * 
 * @param users - Array of users to import
 * @returns Import summary with success/failure counts
 */
export async function batchImportUsers(users: GeneratedUser[]): Promise<BatchImportSummary> {
  logger.info(`Starting batch import of ${users.length} users`);
  
  const summary: BatchImportSummary = {
    total: users.length,
    imported: 0,
    skipped: 0,
    errors: [],
  };
  
  // Process each user individually to handle duplicates gracefully
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    try {
      // Check for existing user with same email or username
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { username: user.username },
          ],
        },
      });
      
      if (existingUser) {
        // User already exists, skip
        const duplicateField = existingUser.email === user.email ? 'email' : 'username';
        const duplicateValue = duplicateField === 'email' ? user.email : user.username;
        
        summary.skipped++;
        summary.errors.push({
          index: i,
          reason: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists: ${duplicateValue}`,
        });
        
        logger.debug('Skipping duplicate user', { index: i, [duplicateField]: duplicateValue });
        continue;
      }
      
      // Hash password
      const hashedPassword = await hashPassword(user.password);
      
      // Create user
      await prisma.user.create({
        data: {
          ...user,
          birthDate: new Date(user.birthDate),
          password: hashedPassword,
        },
      });
      
      summary.imported++;
      logger.debug('User imported successfully', { index: i, username: user.username });
      
    } catch (error) {
      // Unexpected error during import
      summary.skipped++;
      summary.errors.push({
        index: i,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
      
      logger.error('Error importing user', { index: i, error });
    }
  }
  
  logger.info('Batch import completed', {
    total: summary.total,
    imported: summary.imported,
    skipped: summary.skipped,
  });
  
  return summary;
}

/**
 * Find user by email or username
 * Used for login authentication
 * 
 * @param identifier - Email or username
 * @returns User with password (for authentication) or null if not found
 */
export async function findUserByEmailOrUsername(identifier: string) {
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    },
  });
}

/**
 * Find user by username and return profile (without password)
 * 
 * @param username - Username to search for
 * @returns User profile or null if not found
 */
export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
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
    },
  });
}

/**
 * Find user by email and return profile (without password)
 * 
 * @param email - Email to search for
 * @returns User profile or null if not found
 */
export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
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
    },
  });
}

/**
 * Get all users (admin only)
 * Returns paginated list of users without passwords
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Number of users per page
 * @returns Array of user profiles
 */
export async function getAllUsers(page: number = 1, limit: number = 50): Promise<UserProfile[]> {
  const skip = (page - 1) * limit;
  
  return prisma.user.findMany({
    skip,
    take: limit,
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Count total users in database
 * 
 * @returns Total number of users
 */
export async function countUsers(): Promise<number> {
  return prisma.user.count();
}

/**
 * Delete user by username (admin only)
 * 
 * @param username - Username of user to delete
 * @returns Deleted user profile
 */
export async function deleteUser(username: string): Promise<UserProfile> {
  const user = await prisma.user.delete({
    where: { username: username.toLowerCase() },
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
    },
  });
  
  logger.info('User deleted', { username });
  return user;
}
