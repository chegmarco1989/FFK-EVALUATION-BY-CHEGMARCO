/**
 * =============================================================================
 * API RESPONSE UTILITIES
 * =============================================================================
 * Standardized response formatters for consistent API responses.
 * Every endpoint should use these helpers to ensure uniform response structure.
 * 
 * 
 * - Similar to Laravel's response()->json() helper
 * - Ensures all API responses follow the same format
 * - Makes frontend integration easier with predictable structure
 */

import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse, ValidationError } from '../types/index';

/**
 * Send a successful JSON response
 * 
 * @param res - Express response object
 * @param data - Data to send in response
 * @param statusCode - HTTP status code (default: 200)
 * @param message - Optional success message
 * 
 * @example
 * sendSuccess(res, { user: userData }, 201, 'User created successfully');
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  
  res.status(statusCode).json(response);
}

/**
 * Send an error JSON response
 * 
 * @param res - Express response object
 * @param code - Machine-readable error code (e.g., 'DUPLICATE_EMAIL')
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code (default: 400)
 * @param details - Additional error details (validation errors, stack trace, etc.)
 * 
 * @example
 * sendError(res, 'DUPLICATE_EMAIL', 'Email already exists', 409);
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: unknown
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  
  res.status(statusCode).json(response);
}

/**
 * Send validation error response
 * Special formatter for validation failures
 * 
 * @param res - Express response object
 * @param errors - Array of validation errors
 * 
 * @example
 * sendValidationError(res, [
 *   { field: 'email', message: 'Invalid email format' },
 *   { field: 'password', message: 'Password too short' }
 * ]);
 */
export function sendValidationError(
  res: Response,
  errors: ValidationError[]
): void {
  sendError(
    res,
    'VALIDATION_ERROR',
    'Request validation failed',
    400,
    { errors }
  );
}

/**
 * Send "Not Found" error response
 * 
 * @param res - Express response object
 * @param resource - Name of the resource that wasn't found
 * 
 * @example
 * sendNotFound(res, 'User');
 */
export function sendNotFound(
  res: Response,
  resource: string = 'Resource'
): void {
  sendError(
    res,
    'NOT_FOUND',
    `${resource} not found`,
    404
  );
}

/**
 * Send "Unauthorized" error response
 * Use when authentication is required but not provided
 * 
 * @param res - Express response object
 * @param message - Optional custom message
 * 
 * @example
 * sendUnauthorized(res, 'Invalid credentials');
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Authentication required'
): void {
  sendError(
    res,
    'UNAUTHORIZED',
    message,
    401
  );
}

/**
 * Send "Forbidden" error response
 * Use when user is authenticated but doesn't have permission
 * 
 * @param res - Express response object
 * @param message - Optional custom message
 * 
 * @example
 * sendForbidden(res, 'Admin access required');
 */
export function sendForbidden(
  res: Response,
  message: string = 'Access forbidden'
): void {
  sendError(
    res,
    'FORBIDDEN',
    message,
    403
  );
}

/**
 * Send "Conflict" error response
 * Use for duplicate resources or conflicting operations
 * 
 * @param res - Express response object
 * @param message - Description of the conflict
 * 
 * @example
 * sendConflict(res, 'Email already registered');
 */
export function sendConflict(
  res: Response,
  message: string
): void {
  sendError(
    res,
    'CONFLICT',
    message,
    409
  );
}

/**
 * Send "Internal Server Error" response
 * Use for unexpected errors that shouldn't expose details to client
 * 
 * @param res - Express response object
 * @param error - The error object (logged but not sent to client)
 * 
 * @example
 * sendInternalError(res, error);
 */
export function sendInternalError(
  res: Response,
  error?: unknown
): void {
  // Log the actual error for debugging
  if (error) {
    console.error('Internal Server Error:', error);
  }
  
  // Send generic message to client (don't expose internal details!)
  sendError(
    res,
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    500
  );
}

/**
 * Send file download response
 * Sets appropriate headers for file downloads
 * 
 * @param res - Express response object
 * @param data - File content (string or buffer)
 * @param filename - Name of the file to download
 * @param mimeType - MIME type of the file
 * 
 * @example
 * sendFileDownload(res, jsonData, 'users.json', 'application/json');
 */
export function sendFileDownload(
  res: Response,
  data: string | Buffer,
  filename: string,
  mimeType: string = 'application/octet-stream'
): void {
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(data);
}
