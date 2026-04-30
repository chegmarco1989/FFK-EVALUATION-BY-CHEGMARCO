/**
 * =============================================================================
 * AUTHENTICATION MIDDLEWARE
 * =============================================================================
 * This middleware validates JWT tokens and attaches user data to requests.
 * It's the gatekeeper that protects routes requiring authentication.
 * 
 * For PHP/Laravel developers:
 * - Similar to Laravel's auth middleware
 * - Extracts and validates JWT from Authorization header
 * - Attaches decoded user data to request object
 * - Can be applied to individual routes or route groups
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { AuthenticatedRequest, JwtPayload, isJwtPayload } from '../types/index';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Extract JWT token from Authorization header
 * Expected format: "Bearer <token>"
 * 
 * @param authHeader - The Authorization header value
 * @returns The extracted token or null if invalid format
 */
function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }
  
  // Check if header starts with "Bearer "
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Extract token (everything after "Bearer ")
  const token = authHeader.substring(7);
  
  return token || null;
}

/**
 * Verify and decode JWT token
 * 
 * @param token - The JWT token to verify
 * @returns Decoded payload or null if invalid
 */
function verifyToken(token: string): JwtPayload | null {
  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Type guard to ensure decoded data matches expected structure
    if (!isJwtPayload(decoded)) {
      logger.warn('JWT payload has invalid structure', { decoded });
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Token verification failed (expired, invalid signature, etc.)
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('JWT token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.debug('JWT token invalid', { error: error.message });
    } else {
      logger.error('JWT verification error', error);
    }
    
    return null;
  }
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user data to request
 * 
 * Usage:
 *   router.get('/protected', authenticate, controller);
 * 
 * After this middleware runs successfully:
 *   - req.user contains { email, username, role }
 *   - You can safely access req.user in your controllers
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Extract token from Authorization header
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    sendUnauthorized(res, 'No authentication token provided');
    return;
  }
  
  // Verify and decode token
  const payload = verifyToken(token);
  
  if (!payload) {
    sendUnauthorized(res, 'Invalid or expired token');
    return;
  }
  
  // Attach user data to request object
  // Controllers can now access req.user
  req.user = payload;
  
  logger.debug('User authenticated', {
    username: payload.username,
    role: payload.role,
  });
  
  // Continue to next middleware/controller
  next();
}

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required role
 * 
 * Usage:
 *   router.get('/admin-only', authenticate, requireRole('admin'), controller);
 * 
 * @param allowedRoles - Role(s) that are allowed to access the route
 * @returns Middleware function
 */
export function requireRole(...allowedRoles: Array<'admin' | 'user'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // This middleware must run AFTER authenticate middleware
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }
    
    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient permissions', {
        username: req.user.username,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      });
      
      sendForbidden(res, 'Insufficient permissions');
      return;
    }
    
    // User has required role, continue
    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user data if token is present, but doesn't require it
 * Useful for routes that behave differently for authenticated users
 * but are also accessible to guests
 * 
 * Usage:
 *   router.get('/public-but-personalized', optionalAuth, controller);
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  
  // Always continue, whether token was valid or not
  next();
}

/**
 * Middleware to check if user can access a specific user's profile
 * Admins can access any profile, regular users can only access their own
 * 
 * Usage:
 *   router.get('/users/:username', authenticate, canAccessProfile, controller);
 */
export function canAccessProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Must run after authenticate middleware
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }
  
  const requestedUsername = req.params.username;
  
  // Admins can access any profile
  if (req.user.role === 'admin') {
    next();
    return;
  }
  
  // Regular users can only access their own profile
  if (req.user.username !== requestedUsername) {
    logger.warn('User attempted to access another user\'s profile', {
      requester: req.user.username,
      requested: requestedUsername,
    });
    
    sendForbidden(res, 'You can only access your own profile');
    return;
  }
  
  next();
}
