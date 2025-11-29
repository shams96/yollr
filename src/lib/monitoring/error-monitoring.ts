/**
 * Centralized Error Monitoring Service
 *
 * This service provides a unified interface for error monitoring.
 * Configure error monitoring by setting NEXT_PUBLIC_ERROR_MONITORING_ENABLED=true
 * and providing the necessary service credentials.
 *
 * Supported services:
 * - Sentry (recommended for production)
 * - Console logging (default for development)
 */

interface ErrorMonitoringConfig {
  enabled: boolean;
  service: 'sentry' | 'console';
  dsn?: string; // For Sentry
  environment?: string;
  release?: string;
}

interface ErrorContext {
  [key: string]: unknown;
  componentStack?: string;
  errorInfo?: Record<string, unknown>;
}

class ErrorMonitoringService {
  private config: ErrorMonitoringConfig;
  private initialized = false;

  constructor() {
    this.config = {
      enabled: process.env.NEXT_PUBLIC_ERROR_MONITORING_ENABLED === 'true',
      service: (process.env.NEXT_PUBLIC_ERROR_MONITORING_SERVICE as 'sentry' | 'console') || 'console',
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.NEXT_PUBLIC_APP_VERSION,
    };
  }

  /**
   * Initialize the error monitoring service
   */
  public init(): void {
    if (this.initialized) return;

    if (this.config.enabled && this.config.service === 'sentry') {
      this.initSentry();
    }

    this.initialized = true;
  }

  /**
   * Initialize Sentry (when credentials are provided)
   */
  private initSentry(): void {
    // Sentry initialization would go here when package is installed
    // Example:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.init({
    //   dsn: this.config.dsn,
    //   environment: this.config.environment,
    //   release: this.config.release,
    //   tracesSampleRate: 1.0,
    // });

    console.log('[Error Monitoring] Sentry would be initialized here with DSN:', this.config.dsn);
  }

  /**
   * Capture an exception
   */
  public captureException(error: Error, context?: ErrorContext): void {
    if (!this.config.enabled) {
      // In development, just log to console
      console.error('[Error Monitoring - Disabled]', error, context);
      return;
    }

    if (this.config.service === 'sentry') {
      this.captureSentryException(error, context);
    } else {
      this.captureConsoleException(error, context);
    }
  }

  /**
   * Capture exception with Sentry
   */
  private captureSentryException(error: Error, context?: ErrorContext): void {
    // Sentry.captureException(error, { extra: context });
    console.log('[Error Monitoring - Sentry]', error.message, context);
  }

  /**
   * Capture exception with console logging
   */
  private captureConsoleException(error: Error, context?: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      context,
    };

    console.error('[Error Monitoring - Console]', errorData);
  }

  /**
   * Capture a message (for non-error logging)
   */
  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    if (!this.config.enabled) {
      console.log(`[${level.toUpperCase()}]`, message, context);
      return;
    }

    if (this.config.service === 'sentry') {
      // Sentry.captureMessage(message, level);
      console.log(`[Error Monitoring - Sentry] ${level}:`, message, context);
    } else {
      console.log(`[Error Monitoring - Console] ${level}:`, message, context);
    }
  }

  /**
   * Set user context for error tracking
   */
  public setUser(userId: string, email?: string, campusId?: string): void {
    if (!this.config.enabled) return;

    if (this.config.service === 'sentry') {
      // Sentry.setUser({ id: userId, email, campusId });
      console.log('[Error Monitoring - Sentry] User context set:', { userId, email, campusId });
    }
  }

  /**
   * Clear user context
   */
  public clearUser(): void {
    if (!this.config.enabled) return;

    if (this.config.service === 'sentry') {
      // Sentry.setUser(null);
      console.log('[Error Monitoring - Sentry] User context cleared');
    }
  }

  /**
   * Add breadcrumb for debugging context
   */
  public addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    if (this.config.service === 'sentry') {
      // Sentry.addBreadcrumb({ message, category, data });
      console.log('[Error Monitoring - Breadcrumb]', { message, category, data });
    }
  }

  /**
   * Check if monitoring is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Create singleton instance
export const errorMonitoring = new ErrorMonitoringService();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  errorMonitoring.init();
}
