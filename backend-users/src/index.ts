/**
 * =============================================================================
 * APPLICATION ENTRY POINT
 * =============================================================================
 * This is the main file that starts the Express server.
 * It configures middleware, routes, error handling, and starts listening.
 * 
 * For PHP/Laravel developers:
 * - Similar to Laravel's public/index.php and bootstrap/app.php
 * - Initializes the application
 * - Configures middleware stack
 * - Registers routes
 * - Starts the HTTP server
 */

import express, { Express } from 'express';
import config from './config/environment';
import { initializeDatabase, disconnectDatabase } from './config/database';
import { setupSwagger } from './config/swagger';
import {
  helmetMiddleware,
  corsMiddleware,
  requestLogger,
  requestId,
  generalRateLimiter,
} from './middlewares/security.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes/index';
import { logger } from './utils/logger';

/**
 * Create Express application
 */
const app: Express = express();

/**
 * =============================================================================
 * MIDDLEWARE CONFIGURATION
 * =============================================================================
 * Middleware runs in the order it's registered.
 * Order matters! Some middleware depends on others.
 */

// Security middleware (must be first)
app.use(helmetMiddleware); // Set security headers
app.use(corsMiddleware); // Enable CORS
app.use(requestId); // Add unique ID to each request

// Request parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Logging middleware
app.use(requestLogger); // Log all requests

// Rate limiting (general)
app.use('/api', generalRateLimiter);

/**
 * =============================================================================
 * ROUTES
 * =============================================================================
 */

// API routes (all prefixed with /api)
app.use('/api', routes);

// Swagger documentation
setupSwagger(app);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'User Management API',
      version: '1.0.0',
      description: 'Enterprise-grade user management API with authentication and batch import',
      documentation: `/api/docs`,
      health: `/api/health`,
    },
  });
});

/**
 * =============================================================================
 * ERROR HANDLING
 * =============================================================================
 * Error handlers must be registered AFTER all routes
 */

// 404 handler (no route matched)
app.use(notFoundHandler);

// Global error handler (catches all errors)
app.use(errorHandler);

/**
 * =============================================================================
 * SERVER STARTUP
 * =============================================================================
 */

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    logger.info('Initializing database...');
    await initializeDatabase();
    
    // Start listening for requests
    const server = app.listen(config.port, () => {
      logger.info('='.repeat(60));
      logger.info('🚀 SERVER STARTED SUCCESSFULLY');
      logger.info('='.repeat(60));
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Server URL: http://localhost:${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/api/health`);
      logger.info('='.repeat(60));
      logger.info('Available endpoints:');
      logger.info('  POST   /api/auth              - Login');
      logger.info('  GET    /api/users/generate    - Generate fake users');
      logger.info('  POST   /api/users/batch       - Batch import users');
      logger.info('  GET    /api/users/me          - Get current user (auth required)');
      logger.info('  GET    /api/users/:username   - Get user by username (auth required)');
      logger.info('='.repeat(60));
    });
    
    // Graceful shutdown handlers
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connections
        await disconnectDatabase();
        
        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION').catch(() => process.exit(1));
    });
    
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection:', reason);
      shutdown('UNHANDLED_REJECTION').catch(() => process.exit(1));
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
});

// Export app for testing
export default app;
