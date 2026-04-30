/**
 * =============================================================================
 * ROUTES INDEX - CENTRAL ROUTE REGISTRY
 * =============================================================================
 * Aggregates all route modules and mounts them on the Express app.
 * 
 * For PHP/Laravel developers:
 * - Similar to Laravel's RouteServiceProvider
 * - Centralizes all route definitions
 * - Applies common middleware to route groups
 */

import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';

const router = Router();

/**
 * Mount route modules
 * All routes are prefixed with /api (configured in index.ts)
 */

// Authentication routes: /api/auth
router.use('/auth', authRoutes);

// User routes: /api/users
router.use('/users', userRoutes);

/**
 * Health check endpoint
 * Useful for monitoring and load balancers
 * 
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns API health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
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
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       description: Server uptime in seconds
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
