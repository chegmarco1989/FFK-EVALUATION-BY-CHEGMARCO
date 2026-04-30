/**
 * =============================================================================
 * SECURITY MIDDLEWARE
 * =============================================================================
 * Security-related middleware including rate limiting, CORS, and headers.
 * These protect the API from common attacks and abuse.
 * 
 * For PHP/Laravel developers:
 * - Similar to Laravel's throttle middleware and CORS config
 * - Helmet sets secure HTTP headers (like Laravel's secure headers)
 * - Rate limiting prevents brute force attacks
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import config from '../config/environment';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Helmet middleware configuration
 * Sets secure HTTP headers to protect against common vulnerabilities
 * 
 * Headers set by Helmet:
 * - X-DNS-Prefetch-Control: Controls browser DNS prefetching
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-XSS-Protection: Enables browser XSS filter
 * - Strict-Transport-Security: Enforces HTTPS
 * - Content-Security-Policy: Prevents XSS and injection attacks
 */
export const helmetMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
      imgSrc: ["'self'", 'data:', 'https:'], // Allow images from HTTPS sources
    },
  },
  
  // Hide X-Powered-By header (don't advertise we're using Express)
  hidePoweredBy: true,
  
  // Enable HSTS (HTTP Strict Transport Security)
  // Forces browsers to use HTTPS for all future requests
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * CORS middleware configuration
 * Controls which origins can access the API
 * 
 * For PHP/Laravel developers:
 * - Similar to Laravel's CORS middleware
 * - Allows cross-origin requests from specified domains
 * - Prevents unauthorized domains from accessing your API
 */
export const corsMiddleware = cors({
  // Allowed origins (from environment config)
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list
    if (config.security.cors.origins.includes(origin) || config.security.cors.origins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from unauthorized origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization'],
  
  // Expose these headers to the client
  exposedHeaders: ['Content-Disposition'],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Cache preflight requests for 24 hours
  maxAge: 86400,
});

/**
 * Rate limiting middleware for authentication endpoint
 * Prevents brute force attacks on login
 * 
 * Configuration:
 * - Max 5 requests per 15 minutes per IP (configurable via env)
 * - Returns 429 Too Many Requests when limit exceeded
 * - Resets after time window expires
 */
export const authRateLimiter = rateLimit({
  // Time window in milliseconds
  windowMs: config.security.rateLimit.windowMinutes * 60 * 1000,
  
  // Max requests per window
  max: config.security.rateLimit.maxRequests,
  
  // Message sent when limit exceeded
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again later.',
    },
  },
  
  // Return rate limit info in headers
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  
  // Custom handler for rate limit exceeded
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
    });
    
    sendError(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please try again later.',
      429
    );
  },
  
  // Skip rate limiting for successful requests
  // This prevents legitimate users from being locked out
  skipSuccessfulRequests: true,
});

/**
 * General rate limiter for all API endpoints
 * More lenient than auth rate limiter
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Request logging middleware
 * Logs all incoming requests with timing information
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip logging if disabled in config
  if (!config.logging.enableRequestLogging) {
    next();
    return;
  }
  
  const startTime = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.request(req.method, req.url, res.statusCode, duration);
  });
  
  next();
}

/**
 * Request ID middleware
 * Adds unique ID to each request for tracing
 * Useful for debugging and log correlation
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Attach to request object
  (req as Request & { id: string }).id = id;
  
  // Add to response headers
  res.setHeader('X-Request-ID', id);
  
  next();
}

/**
 * File upload size limiter
 * Prevents large file uploads that could exhaust server resources
 */
export function fileSizeLimiter(req: Request, res: Response, next: NextFunction): void {
  const contentLength = req.headers['content-length'];
  
  if (contentLength && parseInt(contentLength) > config.upload.maxFileSize) {
    sendError(
      res,
      'FILE_TOO_LARGE',
      `File size exceeds maximum allowed size of ${config.upload.maxFileSize} bytes`,
      413
    );
    return;
  }
  
  next();
}
