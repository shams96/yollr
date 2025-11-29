/**
 * Comprehensive validation schemas for the Yollr campus engagement platform
 *
 * This module exports all validation schemas organized by domain:
 * - Core: Common validation patterns and utilities
 * - User: User authentication, profiles, and preferences
 * - Campus: Campus operations and management
 * - Squad: Squad management and memberships
 * - Heist: Heist challenges, submissions, and voting
 */

import { z } from 'zod';

// Core validation schemas
export * from './core';
export { coreSchemas } from './core';
import { coreSchemas } from './core';

// Phone validation utilities
export * from './phone';

// User validation schemas
export * from './user';
export { userSchemas } from './user';
import { userSchemas } from './user';

// Campus validation schemas
export * from './campus';
export { campusSchemas } from './campus';
import { campusSchemas } from './campus';

// Squad validation schemas
export * from './squad';
export { squadSchemas } from './squad';
import { squadSchemas } from './squad';

// Heist validation schemas
export * from './heist';
export { heistSchemas } from './heist';
import { heistSchemas } from './heist';

// Re-export commonly used schemas for convenience
export {
  // Core
  VALIDATION_PATTERNS,
  stringValidations,
  numericValidations,
  fileSchema,
  dateSchema,
  paginationSchema,
  idSchema,
  createEnumSchema,
  coordinateSchema,
  locationSchema,
} from './core';

// User schemas are imported from their respective modules
export {
  phoneSchema,
  otpSchema,
  usernameSchema,
  displayNameSchema,
  bioSchema,
  avatarUrlSchema,
  profileSportTypeSchema,
  createUserSchema,
  updateUserSchema,
  createProfileSchema,
  updateProfileSchema,
  phoneVerificationSchema,
  otpRequestSchema,
  otpVerificationSchema,
} from './user';

// Campus schemas
export {
  campusTypeSchema,
  campusRoleSchema,
  createCampusSchema,
  updateCampusSchema,
  geoInferRequestSchema,
} from './campus';

// Squad schemas
export {
  squadTypeSchema,
  squadRoleSchema,
  createSquadSchema,
  updateSquadSchema,
} from './squad';

// Heist schemas
export {
  heistPhaseSchema,
  createHeistSchema,
  updateHeistSchema,
  createHeistSubmissionSchema,
  createHeistVoteSchema,
} from './heist';

// Type exports
export type { CoreSchemas } from './core';
export type { UserSchemas } from './user';
export type { CampusSchemas } from './campus';
export type { SquadSchemas } from './squad';
export type { HeistSchemas } from './heist';

// Validation result types
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// Validation utility functions
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = (error as any).errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path.reduce((obj: any, key: any) => (obj as any)?.[key], data),
      }));
      return {
        success: false,
        errors: errors.map((e: any) => `${e.field}: ${e.message}`)
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error']
    };
  }
};

// Async validation wrapper for API routes
export const validateRequest = async <T>(
  schema: z.ZodSchema<T>,
  request: Request
): Promise<{ data: T } | { errors: ValidationError[] }> => {
  let body: any;
  try {
    body = await request.json();
    const result = schema.parse(body);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = (error as any).errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path.reduce((obj: any, key: any) => (obj as any)?.[key], body),
      }));
      return { errors };
    }
    return {
      errors: [{ field: 'unknown', message: 'Unknown validation error' }]
    };
  }
};

// Create a validation middleware for API routes
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return async (request: Request) => {
    const result = await validateRequest(schema, request);
    if ('errors' in result) {
      return Response.json(
        {
          error: 'Validation failed',
          details: result.errors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    return result.data;
  };
};

// Export all schemas as a single object for easy access
export const schemas = {
  core: coreSchemas,
  user: userSchemas,
  campus: campusSchemas,
  squad: squadSchemas,
  heist: heistSchemas,
} as const;

export type AllSchemas = typeof schemas;