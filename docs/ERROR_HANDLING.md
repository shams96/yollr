# Yollr Error Handling Guide

## Overview

This guide covers comprehensive error handling strategies for the Yollr platform, including error types, handling patterns, debugging techniques, and best practices for building resilient applications.

## Error Categories

### 1. Authentication Errors

#### Phone Authentication Errors
```typescript
// Error codes and messages
export enum AuthErrorCode {
  INVALID_PHONE = 'invalid_phone',
  INVALID_OTP = 'invalid_otp',
  EXPIRED_OTP = 'expired_otp',
  RATE_LIMITED = 'rate_limited',
  SESSION_EXPIRED = 'session_expired',
  USER_BANNED = 'user_banned',
  USER_NOT_FOUND = 'user_not_found',
}

export const AUTH_ERROR_MESSAGES = {
  [AuthErrorCode.INVALID_PHONE]: 'Please enter a valid phone number',
  [AuthErrorCode.INVALID_OTP]: 'Invalid verification code. Please try again.',
  [AuthErrorCode.EXPIRED_OTP]: 'This code has expired. Please request a new one.',
  [AuthErrorCode.RATE_LIMITED]: 'Too many attempts. Please try again later.',
  [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [AuthErrorCode.USER_BANNED]: 'This account has been suspended.',
  [AuthErrorCode.USER_NOT_FOUND]: 'User not found. Please check your phone number.',
};
```

#### Handling Authentication Errors
```typescript
// src/hooks/useAuth.ts
const handleAuthError = (error: any) => {
  // Supabase auth errors
  if (error.code === 'otp_expired') {
    return {
      code: AuthErrorCode.EXPIRED_OTP,
      message: AUTH_ERROR_MESSAGES[AuthErrorCode.EXPIRED_OTP],
      retryable: true,
    };
  }
  
  if (error.code === 'otp_invalid') {
    return {
      code: AuthErrorCode.INVALID_OTP,
      message: AUTH_ERROR_MESSAGES[AuthErrorCode.INVALID_OTP],
      retryable: true,
    };
  }
  
  if (error.code === 'rate_limit_exceeded') {
    return {
      code: AuthErrorCode.RATE_LIMITED,
      message: AUTH_ERROR_MESSAGES[AuthErrorCode.RATE_LIMITED],
      retryable: false,
      retryAfter: 60, // seconds
    };
  }
  
  // Network errors
  if (error.message?.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      retryable: true,
    };
  }
  
  // Generic error
  return {
    code: 'AUTH_ERROR',
    message: 'An authentication error occurred. Please try again.',
    retryable: true,
  };
};
```

### 2. Database Errors

#### Common Database Error Codes
```typescript
export enum DatabaseErrorCode {
  // Connection errors
  CONNECTION_FAILED = 'P0001',
  CONNECTION_TIMEOUT = 'P0002',
  
  // Constraint violations
  UNIQUE_VIOLATION = '23505',
  FOREIGN_KEY_VIOLATION = '23503',
  CHECK_VIOLATION = '23514',
  NOT_NULL_VIOLATION = '23502',
  
  // Permission errors
  INSUFFICIENT_PRIVILEGES = '42501',
  POLICY_VIOLATION = '42501',
  
  // Query errors
  SYNTAX_ERROR = '42601',
  UNDEFINED_TABLE = '42P01',
  UNDEFINED_COLUMN = '42703',
  
  // Transaction errors
  SERIALIZATION_FAILURE = '40001',
  DEADLOCK_DETECTED = '40P01',
}
```

#### Database Error Handler
```typescript
// src/lib/error-handler.ts
export const handleDatabaseError = (error: any) => {
  const { code, message, details, hint } = error;
  
  switch (code) {
    case DatabaseErrorCode.UNIQUE_VIOLATION:
      return {
        code: 'DUPLICATE_ENTRY',
        message: 'This record already exists',
        details: details,
        retryable: false,
      };
    
    case DatabaseErrorCode.FOREIGN_KEY_VIOLATION:
      return {
        code: 'REFERENCE_ERROR',
        message: 'Referenced record does not exist',
        details: details,
        retryable: false,
      };
    
    case DatabaseErrorCode.CONNECTION_TIMEOUT:
      return {
        code: 'DB_TIMEOUT',
        message: 'Database query timed out',
        retryable: true,
        maxRetries: 3,
      };
    
    case DatabaseErrorCode.INSUFFICIENT_PRIVILEGES:
      return {
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to perform this action',
        retryable: false,
      };
    
    case DatabaseErrorCode.POLICY_VIOLATION:
      return {
        code: 'POLICY_VIOLATION',
        message: 'Row Level Security policy violation',
        details: hint,
        retryable: false,
      };
    
    default:
      return {
        code: 'DATABASE_ERROR',
        message: 'A database error occurred',
        details: message,
        retryable: true,
        maxRetries: 3,
      };
  }
};
```

### 3. Network Errors

#### Network Error Types
```typescript
export enum NetworkErrorCode {
  TIMEOUT = 'NETWORK_TIMEOUT',
  OFFLINE = 'OFFLINE',
  CORS_ERROR = 'CORS_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
}
```

#### Network Error Handler
```typescript
// src/lib/error-handler.ts
export const handleNetworkError = (error: any) => {
  // Check if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      code: NetworkErrorCode.OFFLINE,
      message: 'You appear to be offline. Please check your connection.',
      retryable: true,
      retryAfter: 5, // Retry after 5 seconds when back online
    };
  }
  
  // HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          code: NetworkErrorCode.BAD_REQUEST,
          message: 'Invalid request. Please check your input.',
          retryable: false,
        };
      
      case 401:
        return {
          code: NetworkErrorCode.UNAUTHORIZED,
          message: 'Unauthorized. Please sign in again.',
          retryable: false,
          requiresAuth: true,
        };
      
      case 403:
        return {
          code: NetworkErrorCode.FORBIDDEN,
          message: 'You do not have permission to access this resource.',
          retryable: false,
        };
      
      case 404:
        return {
          code: NetworkErrorCode.NOT_FOUND,
          message: 'The requested resource was not found.',
          retryable: false,
        };
      
      case 429:
        return {
          code: NetworkErrorCode.RATE_LIMITED,
          message: 'Too many requests. Please slow down.',
          retryable: true,
          retryAfter: error.headers?.get('Retry-After') || 60,
        };
      
      case 500:
      case 502:
      case 503:
        return {
          code: NetworkErrorCode.SERVER_ERROR,
          message: 'Server error. Please try again later.',
          retryable: true,
          maxRetries: 3,
        };
      
      default:
        return {
          code: 'HTTP_ERROR',
          message: `HTTP error: ${error.status}`,
          retryable: true,
        };
    }
  }
  
  // Timeout
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return {
      code: NetworkErrorCode.TIMEOUT,
      message: 'Request timed out. Please try again.',
      retryable: true,
      maxRetries: 3,
    };
  }
  
  // CORS error
  if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
    return {
      code: NetworkErrorCode.CORS_ERROR,
      message: 'Cross-origin request blocked. Please check your configuration.',
      retryable: false,
    };
  }
  
  return {
    code: 'NETWORK_ERROR',
    message: 'A network error occurred. Please check your connection.',
    retryable: true,
  };
};
```

### 4. Validation Errors

#### Zod Validation Errors
```typescript
// src/lib/validation/error-handler.ts
import { ZodError, ZodIssue } from 'zod';

export const handleValidationError = (error: ZodError) => {
  const errors = error.issues.map((issue: ZodIssue) => {
    const path = issue.path.join('.');
    
    switch (issue.code) {
      case 'invalid_type':
        return {
          field: path,
          message: `${path} must be of type ${issue.expected}`,
          code: 'INVALID_TYPE',
        };
      
      case 'invalid_string':
        return {
          field: path,
          message: `${path} is invalid`,
          code: 'INVALID_FORMAT',
          validation: issue.validation,
        };
      
      case 'too_small':
        return {
          field: path,
          message: `${path} must be at least ${issue.minimum}`,
          code: 'TOO_SHORT',
        };
      
      case 'too_big':
        return {
          field: path,
          message: `${path} must be at most ${issue.maximum}`,
          code: 'TOO_LONG',
        };
      
      case 'custom':
        return {
          field: path,
          message: issue.message,
          code: 'CUSTOM_VALIDATION',
        };
      
      default:
        return {
          field: path,
          message: issue.message,
          code: issue.code,
        };
    }
  });
  
  return {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    errors,
    retryable: false,
  };
};
```

## Error Handling Patterns

### Global Error Boundary

```typescript
// src/components/error/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from './ErrorDisplay';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log to error tracking service
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    }
    
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// src/lib/error-handler.ts
export interface AppError {
  code: string;
  message: string;
  status?: number;
  details?: any;
  retryable?: boolean;
  retryAfter?: number;
  maxRetries?: number;
  requiresAuth?: boolean;
}

export const handleApiError = async (error: any): Promise<AppError> => {
  // Network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return handleNetworkError(error);
  }
  
  // Database error
  if (error.code && error.code.startsWith('P')) {
    return handleDatabaseError(error);
  }
  
  // Supabase auth error
  if (error.name === 'AuthError' || error.name === 'AuthApiError') {
    return handleAuthError(error);
  }
  
  // Validation error
  if (error instanceof ZodError) {
    return handleValidationError(error);
  }
  
  // HTTP error
  if (error.status) {
    return handleNetworkError(error);
  }
  
  // Generic error
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    retryable: false,
  };
};

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    // API logic
  } catch (error) {
    const appError = await handleApiError(error);
    return NextResponse.json(
      { error: appError },
      { status: appError.status || 500 }
    );
  }
}
```

### Retry Logic

```typescript
// src/lib/retry-handler.ts
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoff?: 'linear' | 'exponential';
  retryableErrors?: string[];
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoff = 'exponential',
    retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'DB_TIMEOUT'],
  } = config;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      const appError = await handleApiError(error);
      
      // Check if error is retryable
      if (!appError.retryable || !retryableErrors.includes(appError.code)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay
      const delay = backoff === 'exponential'
        ? retryDelay * Math.pow(2, attempt)
        : retryDelay * (attempt + 1);
      
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Usage
const createMomentWithRetry = async (momentData: any) => {
  return withRetry(
    () => supabase.from('moments').insert([momentData]),
    {
      maxRetries: 3,
      backoff: 'exponential',
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'DB_TIMEOUT'],
    }
  );
};
```

## Error Display Components

### Error Toast

```typescript
// src/components/error/ErrorToast.tsx
import { useState, useEffect } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorToastProps {
  error: AppError;
  onRetry?: () => void;
  onClose?: () => void;
  duration?: number;
}

export function ErrorToast({ 
  error, 
  onRetry, 
  onClose, 
  duration = 5000 
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
      setIsVisible(false);
      onClose?.();
    } catch (retryError) {
      // Retry failed, keep toast visible
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-graphite/90 border border-electric-peach/30 rounded-lg shadow-lg p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-electric-peach flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cloud">
              {error.message}
            </p>
            
            {error.details && (
              <p className="text-xs text-cloud/70 mt-1">
                {JSON.stringify(error.details)}
              </p>
            )}
            
            {error.retryAfter && (
              <p className="text-xs text-cloud/60 mt-1">
                Please try again in {error.retryAfter} seconds
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {error.retryable && onRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="p-1 text-cloud/70 hover:text-cloud transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            <button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              className="p-1 text-cloud/70 hover:text-cloud transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Error Display

```typescript
// src/components/error/ErrorDisplay.tsx
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
}

export function ErrorDisplay({ error, errorInfo, onReset }: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-graphite/50 border border-cloud/20 rounded-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-electric-peach mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-cloud mb-2">
            Something went wrong
          </h1>
          
          <p className="text-cloud/70 mb-6">
            We apologize for the inconvenience. Please try refreshing the page or
            return to the home page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cosmic-pink text-white rounded-lg hover:bg-cosmic-pink/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </button>
            
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-graphite text-cloud border border-cloud/20 rounded-lg hover:bg-graphite/70 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </a>
            
            {onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-graphite text-cloud border border-cloud/20 rounded-lg hover:bg-graphite/70 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
          
          {error && (
            <div className="mt-8 pt-6 border-t border-cloud/10">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-cloud/60 hover:text-cloud transition-colors"
              >
                {showDetails ? 'Hide' : 'Show'} Error Details
              </button>
              
              {showDetails && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-mono text-cloud/80 mb-2">
                    {error.message}
                  </p>
                  
                  {errorInfo?.componentStack && (
                    <pre className="text-xs font-mono text-cloud/60 overflow-x-auto">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Error Monitoring

### Sentry Integration

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export const initMonitoring = () => {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.data) {
        delete event.request.data;
      }
      return event;
    },
  });
};

export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: 'yollr-app',
    },
  });
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};
```

### Error Logging

```typescript
// src/lib/error-handler.ts
export const logError = (error: AppError, context?: any) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    code: error.code,
    message: error.message,
    details: error.details,
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData);
  }
  
  // Send to error tracking service
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    captureError(new Error(error.message), errorData);
  }
  
  // Send to analytics
  if (typeof analytics !== 'undefined') {
    analytics.track('error.occurred', {
      error_code: error.code,
      error_message: error.message,
      retryable: error.retryable,
    });
  }
};
```

## Testing Error Scenarios

### Unit Tests

```typescript
// src/__tests__/lib/error-handler.test.ts
describe('Error Handler', () => {
  it('should handle validation errors', () => {
    const schema = z.object({
      phone: z.string().min(10),
    });
    
    const result = schema.safeParse({ phone: '123' });
    
    if (!result.success) {
      const error = handleValidationError(result.error);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].field).toBe('phone');
    }
  });

  it('should handle network timeout', () => {
    const error = { name: 'AbortError' };
    const handled = handleNetworkError(error);
    
    expect(handled.code).toBe('NETWORK_TIMEOUT');
    expect(handled.retryable).toBe(true);
  });

  it('should handle rate limiting', () => {
    const error = { status: 429, headers: { get: () => '60' } };
    const handled = handleNetworkError(error);
    
    expect(handled.code).toBe('RATE_LIMITED');
    expect(handled.retryAfter).toBe(60);
  });
});
```

### Integration Tests

```typescript
// src/__tests__/hooks/useAuth.test.ts
describe('useAuth error handling', () => {
  it('should handle OTP verification errors', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Mock failed OTP verification
    mockSupabase.auth.verifyOtp.mockRejectedValue({
      code: 'otp_invalid',
      message: 'Invalid OTP',
    });
    
    await act(async () => {
      await result.current.verifyOtp('123456');
    });
    
    expect(result.current.error).toBe('Invalid verification code. Please try again.');
    expect(result.current.loading).toBe(false);
  });

  it('should handle rate limiting', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Mock rate limit error
    mockSupabase.auth.signInWithOtp.mockRejectedValue({
      code: 'rate_limit_exceeded',
      message: 'Too many requests',
    });
    
    await act(async () => {
      await result.current.sendOtp('+1234567890');
    });
    
    expect(result.current.error).toBe('Too many attempts. Please try again later.');
    expect(result.current.loading).toBe(false);
  });
});
```

## Best Practices

### 1. Error Prevention
- Use TypeScript for type safety
- Validate all inputs with Zod schemas
- Implement proper null checks
- Use optional chaining (`?.`)
- Set up ESLint rules for error prevention

### 2. Error Recovery
- Implement retry logic with exponential backoff
- Use circuit breakers for failing services
- Provide fallback UI states
- Cache data for offline support
- Graceful degradation

### 3. User Experience
- Show clear, actionable error messages
- Provide retry buttons when appropriate
- Don't expose technical details to users
- Use friendly language
- Guide users to solutions

### 4. Monitoring
- Log all errors with context
- Track error rates and patterns
- Set up alerts for critical errors
- Monitor performance impact
- Regular error review sessions

### 5. Testing
- Test error scenarios
- Mock error responses
- Test retry logic
- Verify error boundaries
- Test offline behavior

## Troubleshooting Guide

### Common Issues

**"Failed to fetch" Errors**
- Check network connectivity
- Verify API endpoint URLs
- Check CORS configuration
- Ensure HTTPS is used
- Check for ad blockers

**Database Connection Errors**
- Verify Supabase credentials
- Check network access to Supabase
- Verify RLS policies
- Check connection pooling settings
- Monitor connection limits

**Authentication Failures**
- Verify phone number format (E.164)
- Check OTP expiration
- Verify JWT tokens
- Check session storage
- Verify auth policies

**Rate Limiting**
- Implement request queuing
- Add client-side rate limiting
- Cache responses
- Optimize query frequency
- Use webhooks instead of polling

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const debugLog = (category: string, data: any) => {
  if (DEBUG) {
    console.log(`[DEBUG:${category}]`, {
      timestamp: new Date().toISOString(),
      data,
    });
  }
};

// Usage
debugLog('auth', { phone, step: 'otp_sent' });
debugLog('api', { endpoint: '/feed', params: { campus_id } });
debugLog('error', { error: error.code, context });
```

This comprehensive error handling guide provides everything needed to build robust error handling into Yollr applications, from basic error catching to advanced monitoring and recovery strategies.