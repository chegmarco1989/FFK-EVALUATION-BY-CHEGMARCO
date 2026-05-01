/**
 * =============================================================================
 * ERROR HANDLING MIDDLEWARE
 * =============================================================================
 * Centralized error handling for the entire application.
 * This middleware catches all errors thrown in routes and controllers,
 * formats them consistently, and sends appropriate responses.
 * 
 * 
 * - Similar to Laravel's exception handler
 * - Catches all unhandled errors
 * - Formats error responses consistently
 * - Logs errors for debugging
 * - Hides sensitive details in production
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import config from '../config/environment';
import { sendError, sendValidationError, sendInternalError } from '../utils/response';
import { ValidationError } from '../types/index';
import { logger } from '../utils/logger';

/**
 * Custom error class for application-specific errors
 * Allows throwing errors with specific HTTP status codes
 * 
 * Usage:
 *   throw new AppError('User not found', 404, 'USER_NOT_FOUND');
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Zod validation errors
 * Converts Zod error format to our standard validation error format
 */
function handleZodError(error: ZodError, res: Response): void {
  const validationErrors: ValidationError[] = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    value: err.code === 'invalid_type' ? undefined : err,
  }));
  
  logger.debug('Validation error', { errors: validationErrors });
  sendValidationError(res, validationErrors);
}

/**
 * Handle Prisma database errors
 * Converts Prisma-specific errors to user-friendly messages
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, res: Response): void {
  logger.error('Database error', {
    code: error.code,
    meta: error.meta,
  });
  
  switch (error.code) {
    // Unique constraint violation
    case 'P2002': {
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || 'field';
      sendError(
        res,
        'DUPLICATE_ENTRY',
        `A record with this ${field} already exists`,
        409,
        config.isDevelopment() ? { field, meta: error.meta } : undefined
      );
      break;
    }
    
    // Record not found
    case 'P2025': {
      sendError(
        res,
        'NOT_FOUND',
        'The requested record was not found',
        404
      );
      break;
    }
    
    // Foreign key constraint violation
    case 'P2003': {
      sendError(
        res,
        'FOREIGN_KEY_VIOLATION',
        'Related record not found',
        400
      );
      break;
    }
    
    // Database connection error
    case 'P1001':
    case 'P1002': {
      sendError(
        res,
        'DATABASE_CONNECTION_ERROR',
        'Unable to connect to database',
        503
      );
      break;
    }
    
    // Default case for other Prisma errors
    default: {
      sendInternalError(res, error);
    }
  }
}

/**
 * Handle application-specific errors
 */
function handleAppError(error: AppError, res: Response): void {
  logger.error('Application error', {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
  });
  
  sendError(
    res,
    error.code,
    error.message,
    error.statusCode,
    config.isDevelopment() ? error.details : undefined
  );
}

/**
 * Handle generic/unknown errors
 */
function handleGenericError(error: Error, res: Response): void {
  logger.error('Unhandled error', {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
  
  // In development, send detailed error info
  // In production, send generic message (don't expose internals!)
  if (config.isDevelopment()) {
    sendError(
      res,
      'INTERNAL_ERROR',
      error.message,
      500,
      {
        name: error.name,
        stack: error.stack,
      }
    );
  } else {
    sendInternalError(res);
  }
}

/**
 * Global error handling middleware
 * This must be registered AFTER all routes
 * 
 * Express recognizes this as error middleware because it has 4 parameters
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Log the error with request context
  logger.error('Error occurred', {
    method: req.method,
    url: req.url,
    error: error.message,
  });
  
  // Handle different error types
  if (error instanceof ZodError) {
    handleZodError(error, res);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
  } else if (error instanceof AppError) {
    handleAppError(error, res);
  } else {
    handleGenericError(error, res);
  }
}

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 * This should be registered AFTER all routes but BEFORE error handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
  });
  
  sendError(
    res,
    'ROUTE_NOT_FOUND',
    `Cannot ${req.method} ${req.url}`,
    404
  );
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch promise rejections
 * Without this, rejected promises in async handlers won't be caught
 * 
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await userService.getAll();
 *     res.json(users);
 *   }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
