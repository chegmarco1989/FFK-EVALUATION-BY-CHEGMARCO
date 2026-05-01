/**
 * =============================================================================
 * AUTHENTICATION SERVICE
 * =============================================================================
 * Handles authentication logic including login and JWT token generation.
 * 
 * 
 * - Similar to Laravel's Auth facade
 * - Handles credential verification
 * - Generates JWT tokens (like Laravel Sanctum/Passport)
 * - Validates user credentials
 */

import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { JwtPayload, LoginCredentials, AuthResponse } from '../types/index';
import { findUserByEmailOrUsername, comparePassword } from './user.service';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/error.middleware';

/**
 * Generate JWT access token for authenticated user
 * 
 * @param payload - Data to encode in token (email, username, role)
 * @returns Signed JWT token
 */
export function generateAccessToken(payload: JwtPayload): string {
  // Sign token with secret key and set expiration
  const token = jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      issuer: 'user-management-api', // Who issued the token
      audience: 'user-management-client', // Who can use the token
    }
  );
  
  logger.debug('JWT token generated', {
    username: payload.username,
    expiresIn: config.jwt.expiresIn,
  });
  
  return token;
}

/**
 * Authenticate user with credentials and return JWT token
 * 
 * @param credentials - Login credentials (username/email and password)
 * @returns Authentication response with access token
 * @throws AppError if credentials are invalid
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  logger.info('Login attempt', { username: credentials.username });
  
  // Find user by email or username
  const user = await findUserByEmailOrUsername(credentials.username);
  
  if (!user) {
    logger.warn('Login failed - user not found', { username: credentials.username });
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  
  // Compare provided password with stored hash
  const isPasswordValid = await comparePassword(credentials.password, user.password);
  
  if (!isPasswordValid) {
    logger.warn('Login failed - invalid password', {
      username: credentials.username,
      userId: user.id,
    });
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  
  // Credentials are valid, generate JWT token
  const payload: JwtPayload = {
    email: user.email,
    username: user.username,
    role: user.role,
  };
  
  const accessToken = generateAccessToken(payload);
  
  logger.info('Login successful', {
    userId: user.id,
    username: user.username,
    role: user.role,
  });
  
  return { accessToken };
}

/**
 * Verify JWT token and return decoded payload
 * 
 * @param token - JWT token to verify
 * @returns Decoded payload
 * @throws AppError if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'user-management-api',
      audience: 'user-management-client',
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    } else {
      throw new AppError('Token verification failed', 401, 'TOKEN_VERIFICATION_FAILED');
    }
  }
}

/**
 * Refresh access token
 * In a production system, you'd typically use refresh tokens
 * This is a simplified version that generates a new token from an existing valid token
 * 
 * @param oldToken - Current valid token
 * @returns New access token with extended expiration
 */
export function refreshToken(oldToken: string): AuthResponse {
  // Verify old token
  const payload = verifyToken(oldToken);
  
  // Generate new token with same payload
  const newPayload: JwtPayload = {
    email: payload.email,
    username: payload.username,
    role: payload.role,
  };
  
  const accessToken = generateAccessToken(newPayload);
  
  logger.info('Token refreshed', { username: payload.username });
  
  return { accessToken };
}

/**
 * Validate user has required role
 * 
 * @param userRole - User's current role
 * @param requiredRole - Required role for operation
 * @returns True if user has required role
 */
export function hasRole(userRole: 'admin' | 'user', requiredRole: 'admin' | 'user'): boolean {
  // Admin has access to everything
  if (userRole === 'admin') {
    return true;
  }
  
  // User can only access user-level resources
  return userRole === requiredRole;
}

/**
 * Check if user can access another user's profile
 * 
 * @param requestingUserRole - Role of user making the request
 * @param requestingUsername - Username of user making the request
 * @param targetUsername - Username of profile being accessed
 * @returns True if access is allowed
 */
export function canAccessProfile(
  requestingUserRole: 'admin' | 'user',
  requestingUsername: string,
  targetUsername: string
): boolean {
  // Admins can access any profile
  if (requestingUserRole === 'admin') {
    return true;
  }
  
  // Users can only access their own profile
  return requestingUsername === targetUsername;
}
