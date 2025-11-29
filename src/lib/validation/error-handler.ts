import { z } from 'zod';
import type { ValidationError, ValidationResult } from './index';
import { createError, AppError } from '@/lib/error-handler';

/**
 * Enhanced validation error handling for the Yollr platform
 * Integrates Zod validation with the existing error handling system
 */

// Validation error codes
export const VALIDATION_ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE',
  INVALID_ENUM: 'INVALID_ENUM',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_FILE: 'INVALID_FILE',
  INVALID_URL: 'INVALID_URL',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_USERNAME: 'INVALID_USERNAME',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  TOO_SHORT: 'TOO_SHORT',
  TOO_LONG: 'TOO_LONG',
} as const;

export type ValidationErrorCode = typeof VALIDATION_ERROR_CODES[keyof typeof VALIDATION_ERROR_CODES];

// Enhanced validation error interface
export interface EnhancedValidationError extends ValidationError {
  code: ValidationErrorCode;
  severity: 'error' | 'warning' | 'info';
  suggestions?: string[];
  fieldPath: string[];
}

// Validation error mapper
export const mapZodErrorToValidationCode = (zodError: z.ZodIssue): ValidationErrorCode => {
  switch (zodError.code) {
    case 'invalid_type':
      return VALIDATION_ERROR_CODES.INVALID_INPUT;
    case 'invalid_string' as any:
      // @ts-ignore - validation property exists on invalid_string errors
      if (zodError.validation === 'email') return VALIDATION_ERROR_CODES.INVALID_EMAIL;
      // @ts-ignore - validation property exists on invalid_string errors
      if (zodError.validation === 'url') return VALIDATION_ERROR_CODES.INVALID_URL;
      // @ts-ignore - validation property exists on invalid_string errors
      if (zodError.validation === 'uuid') return VALIDATION_ERROR_CODES.INVALID_FORMAT;
      return VALIDATION_ERROR_CODES.INVALID_FORMAT;
    case 'too_small':
      // @ts-ignore - type property exists on too_small errors
      return zodError.type === 'string' ? VALIDATION_ERROR_CODES.TOO_SHORT : VALIDATION_ERROR_CODES.OUT_OF_RANGE;
    case 'too_big':
      // @ts-ignore - type property exists on too_big errors
      return zodError.type === 'string' ? VALIDATION_ERROR_CODES.TOO_LONG : VALIDATION_ERROR_CODES.OUT_OF_RANGE;
    case 'invalid_enum_value' as any:
      return VALIDATION_ERROR_CODES.INVALID_ENUM;
    case 'custom':
      return VALIDATION_ERROR_CODES.INVALID_INPUT;
    default:
      return VALIDATION_ERROR_CODES.INVALID_INPUT;
  }
};

// Create enhanced validation error
export const createValidationError = (
  field: string,
  message: string,
  value: unknown,
  code: ValidationErrorCode = VALIDATION_ERROR_CODES.INVALID_INPUT,
  severity: 'error' | 'warning' | 'info' = 'error',
  suggestions?: string[]
): EnhancedValidationError => ({
  field,
  message,
  value,
  code,
  severity,
  suggestions,
  fieldPath: field.split('.'),
});

// Transform Zod errors to enhanced validation errors
export const transformZodErrors = (zodError: z.ZodError): EnhancedValidationError[] => {
  // @ts-ignore - errors property exists on ZodError
  return zodError.errors.map(err => {
    const code = mapZodErrorToValidationCode(err);
    const field = err.path.join('.');
    
    // Add suggestions based on error type
    let suggestions: string[] | undefined;
    switch (code) {
      case VALIDATION_ERROR_CODES.TOO_SHORT:
        // @ts-ignore - minimum property exists on too_small errors
        suggestions = [`Minimum length: ${err.minimum} characters`];
        break;
      case VALIDATION_ERROR_CODES.TOO_LONG:
        // @ts-ignore - maximum property exists on too_big errors
        suggestions = [`Maximum length: ${err.maximum} characters`];
        break;
      case VALIDATION_ERROR_CODES.WEAK_PASSWORD:
        suggestions = [
          'Use at least 8 characters',
          'Include uppercase and lowercase letters',
          'Include at least one number',
          'Include special characters',
        ];
        break;
      case VALIDATION_ERROR_CODES.INVALID_EMAIL:
        suggestions = ['Example: user@example.com'];
        break;
      case VALIDATION_ERROR_CODES.INVALID_PHONE:
        suggestions = ['Format: +1XXXXXXXXXX (US numbers only)'];
        break;
      case VALIDATION_ERROR_CODES.INVALID_USERNAME:
        suggestions = ['Use 3-20 characters', 'Letters, numbers, underscores, and hyphens only'];
        break;
    }

    return createValidationError(
      field,
      err.message,
      err.path.reduce((obj: any, key: any) => (obj as any)?.[key], undefined),
      code,
      'error',
      suggestions
    );
  });
};

// Create AppError from validation errors
export const createValidationAppError = (
  errors: EnhancedValidationError[],
  message: string = 'Validation failed'
): AppError => {
  const errorDetails = errors.map(err => ({
    field: err.field,
    message: err.message,
    code: err.code,
    value: err.value,
  }));

  const error = createError(message, 400, 'VALIDATION_ERROR');
  // @ts-ignore - Add details to error object
  error.details = errorDetails;
  return error;
};

// Validation result wrapper
export const wrapValidationResult = <T>(
  result: ValidationResult<T>
): { data?: T; error?: AppError } => {
  if (result.success) {
    return { data: result.data };
  }

  const enhancedErrors = result.errors.map(err => {
    // Parse the error string to extract field and message
    const [field, ...messageParts] = err.split(': ');
    const message = messageParts.join(': ');
    
    return createValidationError(
      field || 'unknown',
      message || err,
      undefined,
      VALIDATION_ERROR_CODES.INVALID_INPUT
    );
  });

  return { error: createValidationAppError(enhancedErrors) };
};

// Validate with enhanced error handling
export const validateWithErrorHandling = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options: {
    strict?: boolean;
    partial?: boolean;
    customMessage?: string;
  } = {}
): { data?: T; errors?: EnhancedValidationError[]; error?: AppError } => {
  try {
    let validationSchema = schema;
    
    if (options.partial) {
      // @ts-ignore - partial method exists on ZodSchema
      validationSchema = schema.partial();
    }
    
    if (!options.strict) {
      // @ts-ignore - strip method exists on ZodSchema
      validationSchema = validationSchema.strip();
    }

    const result = validationSchema.parse(data);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const enhancedErrors = transformZodErrors(error);
      return {
        errors: enhancedErrors,
        error: createValidationAppError(enhancedErrors, options.customMessage),
      };
    }
    
    const unknownError = createValidationError(
      'unknown',
      'Unknown validation error',
      undefined,
      VALIDATION_ERROR_CODES.INVALID_INPUT
    );
    
    return {
      errors: [unknownError],
      error: createValidationAppError([unknownError], options.customMessage),
    };
  }
};

// Async validation with error handling
export const validateAsyncWithErrorHandling = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options: { 
    strict?: boolean; 
    partial?: boolean;
    customMessage?: string;
  } = {}
): Promise<{ data?: T; errors?: EnhancedValidationError[]; error?: AppError }> => {
  return validateWithErrorHandling(schema, data, options);
};

// Validation middleware for API routes with enhanced error handling
export const createEnhancedValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const result = validateWithErrorHandling(schema, body);
      
      if (result.error) {
        return Response.json(
          { 
            error: result.error.message,
            code: result.error.code,
            details: result.errors,
            timestamp: new Date().toISOString(),
          },
          { 
            status: result.error.statusCode || 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      return { data: result.data };
    } catch (error) {
      const appError = createError(
        'Failed to parse request body',
        400,
        'INVALID_REQUEST'
      );
      
      return Response.json(
        { 
          error: appError.message,
          code: appError.code,
          timestamp: new Date().toISOString(),
        },
        { 
          status: appError.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
};

// Batch validation utility
export const validateBatch = <T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
  options: { continueOnError?: boolean } = {}
): { 
  valid: Array<{ data: T; index: number }>; 
  invalid: Array<{ error: EnhancedValidationError[]; index: number }> 
} => {
  const valid: Array<{ data: T; index: number }> = [];
  const invalid: Array<{ error: EnhancedValidationError[]; index: number }> = [];

  items.forEach((item, index) => {
    const result = validateWithErrorHandling(schema, item);
    
    if (result.data) {
      valid.push({ data: result.data, index });
    } else if (result.errors) {
      invalid.push({ error: result.errors, index });
    }
  });

  return { valid, invalid };
};

// Export all validation error handling utilities
export const validationErrorHandlers = {
  // Error codes
  VALIDATION_ERROR_CODES,
  
  // Error creation
  createValidationError,
  createValidationAppError,
  
  // Error transformation
  mapZodErrorToValidationCode,
  transformZodErrors,
  
  // Validation with error handling
  validateWithErrorHandling,
  validateAsyncWithErrorHandling,
  validateBatch,
  
  // Middleware
  createEnhancedValidationMiddleware,
  wrapValidationResult,
} as const;

export type ValidationErrorHandlers = typeof validationErrorHandlers;