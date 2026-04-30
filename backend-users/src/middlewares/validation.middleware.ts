/**
 * =============================================================================
 * VALIDATION MIDDLEWARE
 * =============================================================================
 * Middleware factory for validating request data using Zod schemas.
 * Validates body, query parameters, and route parameters.
 * 
 * For PHP/Laravel developers:
 * - Similar to Laravel's FormRequest validation
 * - Validates incoming data before it reaches controllers
 * - Returns 400 with detailed errors if validation fails
 * - Automatically parses and type-casts validated data
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendValidationError } from '../utils/response';
import { ValidationError } from '../types/index';

/**
 * Type for specifying which part of request to validate
 */
type RequestProperty = 'body' | 'query' | 'params';

/**
 * Validation middleware factory
 * Creates middleware that validates specified part of request
 * 
 * @param schema - Zod schema to validate against
 * @param property - Which part of request to validate (body, query, or params)
 * @returns Express middleware function
 * 
 * @example
 * // Validate request body
 * router.post('/users', validate(createUserSchema, 'body'), controller);
 * 
 * @example
 * // Validate query parameters
 * router.get('/users', validate(paginationSchema, 'query'), controller);
 * 
 * @example
 * // Validate route parameters
 * router.get('/users/:id', validate(idParamSchema, 'params'), controller);
 */
export function validate(schema: ZodSchema, property: RequestProperty = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get the data to validate based on property
      const dataToValidate = req[property];
      
      // Validate and parse data
      // If validation succeeds, parsed data replaces original data
      // This ensures type safety and applies transformations (trim, lowercase, etc.)
      const parsed = schema.parse(dataToValidate);
      
      // Replace original data with validated and transformed data
      // This is safe because we've verified the data matches the schema
      (req[property] as typeof parsed) = parsed;
      
      // Validation successful, continue to next middleware
      next();
    } catch (error) {
      // Validation failed
      if (error instanceof ZodError) {
        // Convert Zod errors to our standard format
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.code === 'invalid_type' ? undefined : (err as { received?: unknown }).received,
        }));
        
        sendValidationError(res, validationErrors);
      } else {
        // Unexpected error during validation
        next(error);
      }
    }
  };
}

/**
 * Validate request body
 * Convenience wrapper for validate(schema, 'body')
 * 
 * @example
 * router.post('/users', validateBody(createUserSchema), controller);
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body');
}

/**
 * Validate query parameters
 * Convenience wrapper for validate(schema, 'query')
 * 
 * @example
 * router.get('/users', validateQuery(paginationSchema), controller);
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}

/**
 * Validate route parameters
 * Convenience wrapper for validate(schema, 'params')
 * 
 * @example
 * router.get('/users/:id', validateParams(idParamSchema), controller);
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}

/**
 * Validate multiple parts of request at once
 * Useful when you need to validate body AND query parameters
 * 
 * @example
 * router.post('/users/search',
 *   validateMultiple({
 *     body: searchCriteriaSchema,
 *     query: paginationSchema
 *   }),
 *   controller
 * );
 */
export function validateMultiple(schemas: Partial<Record<RequestProperty, ZodSchema>>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: ValidationError[] = [];
      
      // Validate each specified part of request
      for (const [property, schema] of Object.entries(schemas)) {
        if (!schema) continue;
        
        try {
          const dataToValidate = req[property as RequestProperty];
          const parsed = schema.parse(dataToValidate);
          (req[property as RequestProperty] as typeof parsed) = parsed;
        } catch (error) {
          if (error instanceof ZodError) {
            // Collect errors from this property
            const propertyErrors = error.errors.map((err) => ({
              field: `${property}.${err.path.join('.')}`,
              message: err.message,
              value: err.code === 'invalid_type' ? undefined : (err as { received?: unknown }).received,
            }));
            errors.push(...propertyErrors);
          } else {
            throw error;
          }
        }
      }
      
      // If any validation errors occurred, send them all at once
      if (errors.length > 0) {
        sendValidationError(res, errors);
        return;
      }
      
      // All validations passed
      next();
    } catch (error) {
      next(error);
    }
  };
}
