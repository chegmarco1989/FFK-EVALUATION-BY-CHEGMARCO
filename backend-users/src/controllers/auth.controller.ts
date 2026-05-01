/**
 * =============================================================================
 * AUTHENTICATION CONTROLLER
 * =============================================================================
 * Handles authentication-related HTTP requests.
 * 
 * 
 * - Similar to Laravel's AuthController
 * - Handles login, logout, token refresh
 * - Delegates business logic to auth service
 */

import { Request, Response } from 'express';
import { LoginInput } from '../utils/validation';
import { login } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * POST /api/auth
 * Authenticate user and return JWT token
 * 
 * @param req - Request with login credentials
 * @param res - Response object
 */
export async function loginUser(
  req: Request,
  res: Response
): Promise<void> {
  // Request body is validated by middleware
  const credentials = req.body as LoginInput;
  
  logger.info('Login request', { username: credentials.username });
  
  // Authenticate user and get token
  const authResponse = await login(credentials);
  
  logger.info('Login successful', { username: credentials.username });
  
  // Return token
  sendSuccess(res, authResponse, 200, 'Login successful');
}

/**
 * POST /api/auth/logout
 * Logout user (client-side token deletion)
 * 
 * Note: With JWT, logout is typically handled client-side by deleting the token.
 * This endpoint exists for consistency and can be extended to implement
 * token blacklisting if needed.
 * 
 * @param req - Request object
 * @param res - Response object
 */
export async function logoutUser(
  req: Request,
  res: Response
): Promise<void> {
  logger.info('Logout request');
  
  // In a JWT-based system, logout is handled client-side
  // The client should delete the token from storage
  
  // If you need server-side logout, you could:
  // 1. Implement token blacklisting (store revoked tokens in Redis)
  // 2. Use refresh tokens with database storage
  // 3. Implement session-based auth instead of JWT
  
  sendSuccess(res, null, 200, 'Logout successful');
}
