/**
 * =============================================================================
 * AUTHENTICATION ROUTES
 * =============================================================================
 * Defines authentication-related API endpoints.
 */

import { Router } from 'express';
import { loginUser, logoutUser } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { authRateLimiter } from '../middlewares/security.middleware';
import { loginSchema } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     description: Login with username/email and password. Returns JWT access token on success.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Email or username
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authRateLimiter, // Rate limit login attempts to prevent brute force
  validateBody(loginSchema),
  asyncHandler(loginUser)
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout endpoint (client should delete token)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
router.post(
  '/logout',
  asyncHandler(logoutUser)
);

export default router;
