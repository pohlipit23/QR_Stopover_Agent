/**
 * Production Monitoring and Analytics System
 * Qatar Airways Stopover AI Agent
 */

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  environment: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: string;
  environment: string;
  userAgent?: string;
  url?: string;
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
}

class MonitoringService {
  private environment: string;
  private logLevel: keyof LogLevel;
  private enabledFeatures: {
    logging: boolean;
    analytics: boolean;
    performance: boolean;
    errorReporting: boolean;
  };

  constructor() {
    this.environment = this.getEnvVar('ENVIRONMENT', 'development');
    this.logLevel = this.getEnvVar('LOG_LEVEL', 'info') as keyof LogLevel;
    
    // Reference NODE_ENV for completeness
    const nodeEnv = this.getEnvVar('NODE_ENV', 'development');
    
    this.enabledFeatures = {
      logging: this.getEnvVar('ENABLE_REQUEST_LOGGING', 'true') === 'true',
      analytics: this.getEnvVar('ANALYTICS_ENABLED', 'false') === 'true',
      performance: this.getEnvVar('PERFORMANCE_MONITORING_ENABLED', 'false') === 'true',
      errorReporting: this.getEnvVar('ERROR_REPORTING_ENABLED', 'false') === 'true',
    };
  }

  private getEnvVar(key: string, defaultValue: string): string {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: Record<keyof LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    
    return levels[level] <= levels[this.logLevel];
  }

  private formatLogEntry(entry: LogEntry): string {
    const logFormat = this.getEnvVar('LOG_FORMAT', 'json');
    
    if (logFormat === 'json') {
      return JSON.stringify(entry);
    } else {
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message} ${
        entry.context ? JSON.stringify(entry.context) : ''
      }`;
    }
  }

  /**
   * Log messages with different severity levels
   */
  log(level: keyof LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.enabledFeatures.logging || !this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      environment: this.environment,
    };

    const formattedLog = this.formatLogEntry(entry);

    // In production, send to external logging service
    if (this.environment === 'production') {
      this.sendToExternalLogger(entry);
    } else {
      // Development/staging: use console
      console[level](formattedLog);
    }
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Report errors to monitoring service
   */
  reportError(error: Error, context?: Record<string, any>): void {
    if (!this.enabledFeatures.errorReporting) {
      return;
    }

    const errorReport: ErrorReport = {
      error,
      context,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.error(`Unhandled error: ${error.message}`, {
      stack: error.stack,
      ...context,
    });

    // In production, send to error reporting service (e.g., Sentry)
    if (this.environment === 'production') {
      this.sendToErrorReporting(errorReport);
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(name: string, value: number, unit: 'ms' | 'bytes' | 'count', context?: Record<string, any>): void {
    if (!this.enabledFeatures.performance) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
    };

    this.debug(`Performance metric: ${name} = ${value}${unit}`, context);

    // In production, send to analytics service
    if (this.environment === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Track user analytics events
   */
  trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.enabledFeatures.analytics) {
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.info(`Analytics event: ${event}`, properties);

    // In production, send to analytics service
    if (this.environment === 'production') {
      this.sendToAnalytics(analyticsEvent);
    }
  }

  /**
   * Track LLM-specific metrics
   */
  trackLLMMetrics(metrics: {
    model: string;
    tokensUsed: number;
    responseTime: number;
    success: boolean;
    functionCalls?: number;
  }): void {
    this.trackPerformance('llm_response_time', metrics.responseTime, 'ms', {
      model: metrics.model,
      success: metrics.success,
    });

    this.trackPerformance('llm_tokens_used', metrics.tokensUsed, 'count', {
      model: metrics.model,
    });

    if (metrics.functionCalls) {
      this.trackPerformance('llm_function_calls', metrics.functionCalls, 'count', {
        model: metrics.model,
      });
    }

    this.trackEvent('llm_request_completed', {
      model: metrics.model,
      tokensUsed: metrics.tokensUsed,
      responseTime: metrics.responseTime,
      success: metrics.success,
      functionCalls: metrics.functionCalls,
    });
  }

  /**
   * Track user journey events
   */
  trackUserJourney(step: string, data?: Record<string, any>): void {
    this.trackEvent('user_journey_step', {
      step,
      ...data,
    });
  }

  /**
   * Track booking funnel events
   */
  trackBookingFunnel(stage: 'started' | 'category_selected' | 'hotel_selected' | 'extras_selected' | 'payment_initiated' | 'completed', data?: Record<string, any>): void {
    this.trackEvent('booking_funnel', {
      stage,
      ...data,
    });
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    // Implementation would send to external logging service
    // For now, fallback to console in production
    console.log(this.formatLogEntry(entry));
  }

  private async sendToErrorReporting(errorReport: ErrorReport): Promise<void> {
    // Implementation would send to Sentry or similar service
    // For now, log the error
    console.error('Error Report:', errorReport);
  }

  private async sendToAnalytics(data: PerformanceMetric | AnalyticsEvent): Promise<void> {
    // Implementation would send to analytics service
    // For now, log the analytics data
    console.log('Analytics:', data);
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Convenience functions
export const logger = {
  error: (message: string, context?: Record<string, any>) => monitoring.error(message, context),
  warn: (message: string, context?: Record<string, any>) => monitoring.warn(message, context),
  info: (message: string, context?: Record<string, any>) => monitoring.info(message, context),
  debug: (message: string, context?: Record<string, any>) => monitoring.debug(message, context),
};

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => monitoring.trackEvent(event, properties),
  trackPerformance: (name: string, value: number, unit: 'ms' | 'bytes' | 'count', context?: Record<string, any>) => 
    monitoring.trackPerformance(name, value, unit, context),
  trackLLM: (metrics: Parameters<typeof monitoring.trackLLMMetrics>[0]) => monitoring.trackLLMMetrics(metrics),
  trackJourney: (step: string, data?: Record<string, any>) => monitoring.trackUserJourney(step, data),
  trackBooking: (stage: Parameters<typeof monitoring.trackBookingFunnel>[0], data?: Record<string, any>) => 
    monitoring.trackBookingFunnel(stage, data),
};

export const errorReporter = {
  report: (error: Error, context?: Record<string, any>) => monitoring.reportError(error, context),
};

// Global error handler setup
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorReporter.report(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorReporter.report(new Error(event.reason), {
      type: 'unhandled_promise_rejection',
    });
  });
}