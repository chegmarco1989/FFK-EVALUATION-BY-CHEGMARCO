/**
 * =============================================================================
 * USER ROUTES
 * =============================================================================
 * Defines all user-related API endpoints.
 * 
 * 
 * - Similar to Laravel's routes/api.php
 * - Maps HTTP methods and paths to controllers
 * - Applies middleware (auth, validation, etc.)
 * - Groups related routes together
 */

import { Router } from 'express';
import {
  generateUsers,
  batchImport,
  getCurrentUser,
  getUserByUsername,
  uploadMiddleware,
} from '../controllers/user.controller';
import { authenticate, canAccessProfile } from '../middlewares/auth.middleware';
import { validateQuery, validateParams } from '../middlewares/validation.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { fileSizeLimiter } from '../middlewares/security.middleware';
import {
  generateUsersQuerySchema,
  usernameParamSchema,
} from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/users/generate:
 *   get:
 *     summary: Generate fake users and download as JSON
 *     description: Generates N realistic fake users using Faker.js and triggers automatic file download
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of users to generate (1-1000)
 *     responses:
 *       200:
 *         description: JSON file with generated users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GeneratedUser'
 *       400:
 *         description: Invalid count parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/generate',
  validateQuery(generateUsersQuerySchema),
  asyncHandler(generateUsers)
);

/**
 * @swagger
 * /api/users/batch:
 *   post:
 *     summary: Batch import users from JSON file
 *     description: Uploads a JSON file containing users and imports them into the database. Handles duplicates gracefully.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: JSON file containing array of users
 *     responses:
 *       200:
 *         description: Import summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchImportSummary'
 *       400:
 *         description: Invalid file or format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/batch',
  fileSizeLimiter,
  uploadMiddleware,
  asyncHandler(batchImport)
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user's profile
 *     description: Returns the profile of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(getCurrentUser)
);

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get user profile by username
 *     description: Returns user profile. Admins can view any profile, regular users can only view their own.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user to retrieve
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:username',
  authenticate,
  validateParams(usernameParamSchema),
  canAccessProfile,
  asyncHandler(getUserByUsername)
);

export default router;
