/**
 * =============================================================================
 * USER CONTROLLER - HTTP REQUEST HANDLERS
 * =============================================================================
 * Controllers handle HTTP requests and responses.
 * They validate input, call services, and format responses.
 * 
 * For PHP/Laravel developers:
 * - Similar to Laravel controllers
 * - Thin layer between routes and business logic
 * - Handles HTTP concerns (request/response)
 * - Business logic lives in services
 */

import { Response } from 'express';
import multer from 'multer';
import { AuthenticatedRequest } from '../types/index';
import { GenerateUsersQuery, BatchImportInput } from '../utils/validation';
import {
  generateFakeUsers,
  batchImportUsers,
  findUserByUsername,
  findUserByEmail,
} from '../services/user.service';
import { sendSuccess, sendFileDownload, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/error.middleware';
import config from '../config/environment';

/**
 * Configure multer for file uploads
 * Stores files in memory as Buffer (not on disk)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Only accept JSON files
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new AppError('Only JSON files are allowed', 400, 'INVALID_FILE_TYPE'));
    }
  },
});

/**
 * Multer middleware for single file upload
 * Use this in routes: upload.single('file')
 */
export const uploadMiddleware = upload.single('file');

/**
 * GET /api/users/generate?count=N
 * Generate N fake users and trigger file download
 * 
 * @param req - Request with count query parameter
 * @param res - Response object
 */
export async function generateUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  // Query parameters are validated by middleware
  const { count } = req.query as unknown as GenerateUsersQuery;
  
  logger.info('Generating users for download', { count });
  
  // Generate fake users
  const users = await generateFakeUsers(count);
  
  // Convert to JSON string with pretty formatting
  const jsonData = JSON.stringify(users, null, 2);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `users-${count}-${timestamp}.json`;
  
  logger.info('Sending generated users file', { filename, count });
  
  // Send as downloadable file
  sendFileDownload(res, jsonData, filename, 'application/json');
}

/**
 * POST /api/users/batch
 * Import users from uploaded JSON file
 * 
 * @param req - Request with uploaded file
 * @param res - Response object
 */
export async function batchImport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  // Check if file was uploaded
  if (!req.file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE_UPLOADED');
  }
  
  logger.info('Processing batch import', {
    filename: req.file.originalname,
    size: req.file.size,
  });
  
  // Parse JSON from uploaded file
  let users: BatchImportInput;
  try {
    const fileContent = req.file.buffer.toString('utf-8');
    users = JSON.parse(fileContent) as BatchImportInput;
  } catch (error) {
    logger.error('Failed to parse uploaded JSON', error);
    throw new AppError('Invalid JSON file', 400, 'INVALID_JSON');
  }
  
  // Validate that it's an array
  if (!Array.isArray(users)) {
    throw new AppError('JSON file must contain an array of users', 400, 'INVALID_FORMAT');
  }
  
  if (users.length === 0) {
    throw new AppError('JSON file must contain at least one user', 400, 'EMPTY_ARRAY');
  }
  
  logger.info(`Importing ${users.length} users from file`);
  
  // Import users
  const summary = await batchImportUsers(users);
  
  logger.info('Batch import completed', summary);
  
  // Return summary
  sendSuccess(res, summary, 200, 'Batch import completed');
}

/**
 * GET /api/users/me
 * Get current authenticated user's profile
 * 
 * @param req - Authenticated request
 * @param res - Response object
 */
export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  // User data is attached by auth middleware
  if (!req.user) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }
  
  logger.debug('Fetching current user profile', { username: req.user.username });
  
  // Fetch full user profile from database
  const user = await findUserByEmail(req.user.email);
  
  if (!user) {
    // This shouldn't happen if JWT is valid, but handle it anyway
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  sendSuccess(res, user);
}

/**
 * GET /api/users/:username
 * Get user profile by username
 * Authorization: Admins can view any profile, users can only view their own
 * 
 * @param req - Authenticated request with username parameter
 * @param res - Response object
 */
export async function getUserByUsername(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { username } = req.params;
  
  // Authorization is handled by canAccessProfile middleware
  // If we reach here, user is authorized to view this profile
  
  logger.debug('Fetching user profile', { username });
  
  const user = await findUserByUsername(username);
  
  if (!user) {
    sendNotFound(res, 'User');
    return;
  }
  
  sendSuccess(res, user);
}
