/**
 * =============================================================================
 * SWAGGER/OPENAPI CONFIGURATION
 * =============================================================================
 * Configures Swagger UI for interactive API documentation.
 * Accessible at /api/docs when server is running.
 * 
 * 
 * - Similar to Laravel's API documentation packages (L5-Swagger, Scramble)
 * - Provides interactive API testing interface
 * - Auto-generates documentation from JSDoc comments
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from './environment';

/**
 * Swagger definition
 * Describes the API metadata and configuration
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'User Management API',
    version: '1.0.0',
    description: `
# User Management API

Enterprise-grade REST API for user management with authentication, batch import, and comprehensive security.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **User Management** - Complete CRUD operations for users
- 📦 **Batch Import** - Import users from JSON files with duplicate handling
- 🎲 **Fake Data Generation** - Generate realistic test data with Faker.js
- 🔒 **Role-Based Access Control** - Admin and user roles with granular permissions
- 🛡️ **Security** - Rate limiting, CORS, Helmet, bcrypt password hashing
- ✅ **Validation** - Comprehensive input validation with Zod
- 📊 **Error Handling** - Consistent error responses across all endpoints

## Authentication

Most endpoints require authentication. To authenticate:

1. Call \`POST /api/auth\` with valid credentials
2. Copy the \`accessToken\` from the response
3. Click the "Authorize" button above
4. Enter: \`Bearer <your-token>\`
5. Click "Authorize" and "Close"

Now all authenticated requests will include your token automatically.

## Rate Limiting

- Authentication endpoint: ${config.security.rateLimit.maxRequests} requests per ${config.security.rateLimit.windowMinutes} minutes
- Other endpoints: 100 requests per 15 minutes

## Error Responses

All errors follow this format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  }
}
\`\`\`
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'System',
      description: 'System health and monitoring endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      // User Profile Schema
      UserProfile: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'User ID',
            example: 1,
          },
          firstName: {
            type: 'string',
            description: 'First name',
            example: 'John',
          },
          lastName: {
            type: 'string',
            description: 'Last name',
            example: 'Doe',
          },
          birthDate: {
            type: 'string',
            format: 'date-time',
            description: 'Date of birth',
            example: '1990-05-15T00:00:00.000Z',
          },
          city: {
            type: 'string',
            description: 'City of residence',
            example: 'New York',
          },
          country: {
            type: 'string',
            description: 'ISO2 country code',
            example: 'US',
          },
          avatar: {
            type: 'string',
            format: 'uri',
            description: 'Avatar image URL',
            example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
          },
          company: {
            type: 'string',
            description: 'Company name',
            example: 'Acme Corporation',
          },
          jobPosition: {
            type: 'string',
            description: 'Job title',
            example: 'Senior Developer',
          },
          mobile: {
            type: 'string',
            description: 'Phone number',
            example: '+1-555-123-4567',
          },
          username: {
            type: 'string',
            description: 'Unique username',
            example: 'johndoe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address',
            example: 'john.doe@example.com',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
            example: 'user',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      
      // Generated User Schema (for download)
      GeneratedUser: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          birthDate: { type: 'string', format: 'date-time', example: '1990-05-15T00:00:00.000Z' },
          city: { type: 'string', example: 'New York' },
          country: { type: 'string', example: 'US' },
          avatar: { type: 'string', format: 'uri', example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe' },
          company: { type: 'string', example: 'Acme Corporation' },
          jobPosition: { type: 'string', example: 'Senior Developer' },
          mobile: { type: 'string', example: '+1-555-123-4567' },
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          password: { type: 'string', description: 'Plain text password (only in generated JSON!)', example: 'abc123' },
          role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
        },
      },
      
      // Batch Import Summary Schema
      BatchImportSummary: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total users in uploaded file',
            example: 100,
          },
          imported: {
            type: 'integer',
            description: 'Successfully imported users',
            example: 87,
          },
          skipped: {
            type: 'integer',
            description: 'Skipped users (duplicates or errors)',
            example: 13,
          },
          errors: {
            type: 'array',
            description: 'List of errors encountered',
            items: {
              type: 'object',
              properties: {
                index: {
                  type: 'integer',
                  description: 'Index of user in array',
                  example: 5,
                },
                reason: {
                  type: 'string',
                  description: 'Error reason',
                  example: 'Email already exists: john@doe.com',
                },
              },
            },
          },
        },
      },
      
      // Error Schema
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Machine-readable error code',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                description: 'Human-readable error message',
                example: 'Request validation failed',
              },
              details: {
                type: 'object',
                description: 'Additional error context (optional)',
              },
            },
          },
        },
      },
    },
  },
};

/**
 * Swagger JSDoc options
 * Tells swagger-jsdoc where to find API documentation
 */
const swaggerOptions = {
  definition: swaggerDefinition,
  // Path to files containing Swagger annotations
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

/**
 * Generate Swagger specification
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Setup Swagger UI middleware
 * 
 * @param app - Express application
 */
export function setupSwagger(app: Express): void {
  // Serve Swagger UI at /api/docs
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'User Management API Documentation',
      customfavIcon: '/favicon.ico',
    })
  );
  
  // Serve raw OpenAPI spec as JSON at /api/docs.json
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log(`📚 Swagger documentation available at http://localhost:${config.port}/api/docs`);
}

export default swaggerSpec;
