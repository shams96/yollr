import type { NextRequest } from 'next/server';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class AppError extends Error {
  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  return new AppError(message, statusCode, code);
};

export const handleApiError = (error: unknown): { error: AppError; status: number } => {
  // Handle known AppError instances
  if (error instanceof AppError) {
    return {
      error,
      status: error.statusCode || 500,
    };
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string };
    
    // Map common Supabase error codes to HTTP status codes
    const errorMap: Record<string, number> = {
      'PGRST116': 404, // Not found
      '23505': 409,   // Unique violation
      '23503': 400,   // Foreign key violation
      '42501': 403,   // Insufficient privileges
      'P0001': 400,   // User-defined exception
    };

    return {
      error: createError(
        supabaseError.message || 'Database operation failed',
        errorMap[supabaseError.code] || 500,
        supabaseError.code
      ),
      status: errorMap[supabaseError.code] || 500,
    };
  }

  // Handle network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      error: createError('Network error. Please check your connection.', 503, 'NETWORK_ERROR'),
      status: 503,
    };
  }

  // Handle validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return {
      error: createError(error.message, 400, 'VALIDATION_ERROR'),
      status: 400,
    };
  }

  // Default error handling
  console.error('Unhandled error:', error);
  
  return {
    error: createError(
      process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : (error as Error).message || 'Unknown error',
      500,
      'INTERNAL_ERROR'
    ),
    status: 500,
  };
};

export const logError = (error: Error, context?: Record<string, unknown>): void => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData);
  }

  // Send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    const { errorMonitoring } = require('./monitoring/error-monitoring');
    errorMonitoring.captureException(error, context);
  }
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorContext?: Record<string, unknown>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const appError = error instanceof AppError ? error : createError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
    
    logError(appError, errorContext);
    throw appError;
  }
};

export const createErrorResponse = (error: AppError, request?: NextRequest) => {
  const response = {
    error: {
      message: error.message,
      code: error.code,
      status: error.statusCode,
    },
    timestamp: new Date().toISOString(),
    path: request?.url || 'unknown',
  };

  return Response.json(response, {
    status: error.statusCode || 500,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};