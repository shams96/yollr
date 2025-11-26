import { logError, AppError } from './error-handler';

export interface MonitoringConfig {
  enabled: boolean;
  environment: string;
  serviceName: string;
  version: string;
}

class ErrorMonitor {
  private config: MonitoringConfig;
  private errorQueue: Array<{
    error: Error;
    context?: Record<string, unknown>;
    timestamp: string;
  }> = [];

  constructor(config: MonitoringConfig) {
    this.config = config;
    
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      this.setupBrowserErrorHandlers();
    } else {
      this.setupServerErrorHandlers();
    }

    // Periodically flush error queue
    if (config.enabled) {
      setInterval(() => this.flushErrors(), 30000); // Flush every 30 seconds
    }
  }

  private setupBrowserErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'uncaught_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: 'unhandled_promise_rejection' }
      );
    });

    // Monitor performance metrics
    if ('performance' in window) {
      this.setupPerformanceMonitoring();
    }
  }

  private setupServerErrorHandlers() {
    // Server-side error handling would go here
    // For example, handling uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.captureError(error, { type: 'uncaught_exception' });
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.captureError(
        reason instanceof Error ? reason : new Error(String(reason)),
        { type: 'unhandled_rejection' }
      );
    });
  }

  private setupPerformanceMonitoring() {
    // Monitor Core Web Vitals and other performance metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.trackMetric('page_load_time', entry.duration);
        } else if (entry.entryType === 'measure') {
          this.trackMetric(entry.name, entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });
  }

  public captureError(error: Error, context?: Record<string, unknown>) {
    // Log error locally
    logError(error, context);

    // Add to queue for batch reporting
    if (this.config.enabled) {
      this.errorQueue.push({
        error,
        context,
        timestamp: new Date().toISOString(),
      });

      // Flush immediately if queue gets large
      if (this.errorQueue.length >= 10) {
        this.flushErrors();
      }
    }
  }

  public trackMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.config.enabled) return;

    const metric = {
      name,
      value,
      tags: {
        ...tags,
        environment: this.config.environment,
        service: this.config.serviceName,
        version: this.config.version,
      },
      timestamp: new Date().toISOString(),
    };

    // In a real implementation, this would send to a metrics service
    console.log('Metric tracked:', metric);
  }

  public trackEvent(name: string, properties?: Record<string, unknown>) {
    if (!this.config.enabled) return;

    const event = {
      name,
      properties: {
        ...properties,
        environment: this.config.environment,
        service: this.config.serviceName,
        version: this.config.version,
      },
      timestamp: new Date().toISOString(),
    };

    // In a real implementation, this would send to an analytics service
    console.log('Event tracked:', event);
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In a real implementation, this would send to an error tracking service
      // Example: await fetch('https://your-error-service.com/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     errors: errorsToSend,
      //     config: this.config,
      //   }),
      // });

      console.log(`Flushing ${errorsToSend.length} errors to monitoring service`);
    } catch (error) {
      console.error('Failed to flush errors:', error);
      // Put errors back in queue to retry later
      this.errorQueue.unshift(...errorsToSend);
    }
  }
}

// Create singleton instance
const monitoringConfig: MonitoringConfig = {
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV || 'development',
  serviceName: 'yollr-app',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
};

export const errorMonitor = new ErrorMonitor(monitoringConfig);

// Convenience functions
export const captureError = (error: Error, context?: Record<string, unknown>) => {
  errorMonitor.captureError(error, context);
};

export const trackMetric = (name: string, value: number, tags?: Record<string, string>) => {
  errorMonitor.trackMetric(name, value, tags);
};

export const trackEvent = (name: string, properties?: Record<string, unknown>) => {
  errorMonitor.trackEvent(name, properties);
};

// Performance monitoring helpers
export const startTimer = (name: string) => {
  if (typeof performance !== 'undefined') {
    performance.mark(`${name}_start`);
  }
};

export const endTimer = (name: string) => {
  if (typeof performance !== 'undefined') {
    performance.mark(`${name}_end`);
    performance.measure(name, `${name}_start`, `${name}_end`);
  }
};