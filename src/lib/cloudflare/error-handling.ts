/**
 * Error handling and fallback mechanisms for Cloudflare data services
 * Provides comprehensive error recovery and graceful degradation
 */

export interface DataServiceError {
  service: 'kv' | 'r2' | 'durable-objects';
  operation: string;
  error: Error;
  timestamp: number;
  retryable: boolean;
  fallbackUsed?: boolean;
}

export interface FallbackConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  fallbackToLocal: boolean;
  gracefulDegradation: boolean;
}

export class DataServiceErrorHandler {
  private errors: DataServiceError[] = [];
  private config: FallbackConfig;
  private localFallbacks: Map<string, any> = new Map();

  constructor(config: Partial<FallbackConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      fallbackToLocal: true,
      gracefulDegradation: true,
      ...config,
    };

    this.initializeLocalFallbacks();
  }

  /**
   * Execute operation with error handling and retries
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    service: DataServiceError['service'],
    operationName: string,
    fallbackValue?: T
  ): Promise<T> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        attempt++;

        const serviceError: DataServiceError = {
          service,
          operation: operationName,
          error: lastError,
          timestamp: Date.now(),
          retryable: this.isRetryableError(lastError),
        };

        this.logError(serviceError);

        if (attempt <= this.config.maxRetries && serviceError.retryable) {
          const delay = this.calculateRetryDelay(attempt);
          await this.sleep(delay);
          continue;
        }

        break;
      }
    }

    // All retries failed, try fallback
    if (this.config.fallbackToLocal && fallbackValue !== undefined) {
      console.warn(`Using fallback for ${service}:${operationName}`);
      return fallbackValue;
    }

    // Try local fallback data
    const localFallback = this.getLocalFallback(service, operationName);
    if (localFallback !== null) {
      console.warn(`Using local fallback for ${service}:${operationName}`);
      return localFallback;
    }

    // If graceful degradation is enabled, return a safe default
    if (this.config.gracefulDegradation) {
      return this.getGracefulDefault(service, operationName);
    }

    throw lastError;
  }

  /**
   * Handle KV store errors with fallbacks
   */
  async handleKVError<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue?: T
  ): Promise<T> {
    return this.executeWithRetry(operation, 'kv', operationName, fallbackValue);
  }

  /**
   * Handle R2 storage errors with fallbacks
   */
  async handleR2Error<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue?: T
  ): Promise<T> {
    return this.executeWithRetry(operation, 'r2', operationName, fallbackValue);
  }

  /**
   * Handle Durable Objects errors with fallbacks
   */
  async handleDurableObjectError<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue?: T
  ): Promise<T> {
    return this.executeWithRetry(operation, 'durable-objects', operationName, fallbackValue);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /rate limit/i,
      /throttle/i,
      /503/,
      /502/,
      /504/,
    ];

    const errorMessage = error.message.toLowerCase();
    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.config.exponentialBackoff) {
      return this.config.retryDelay;
    }

    return this.config.retryDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log error for monitoring
   */
  private logError(error: DataServiceError): void {
    this.errors.push(error);
    
    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    console.error(`Data service error [${error.service}:${error.operation}]:`, {
      error: error.error.message,
      timestamp: new Date(error.timestamp).toISOString(),
      retryable: error.retryable,
    });
  }

  /**
   * Get local fallback data
   */
  private getLocalFallback(service: string, operation: string): any {
    const key = `${service}:${operation}`;
    return this.localFallbacks.get(key) || null;
  }

  /**
   * Get graceful default value
   */
  private getGracefulDefault<T>(service: string, operation: string): T {
    const defaults: Record<string, any> = {
      'kv:getConfig': {
        llmSettings: {
          defaultModel: 'google/gemini-2.0-flash-exp',
          fallbackModels: ['anthropic/claude-3-haiku'],
          maxTokens: 4096,
          temperature: 0.7,
        },
        featureFlags: {
          voiceInputEnabled: false,
          advancedAnalytics: true,
          debugMode: false,
        },
      },
      'kv:getFeatureFlag': false,
      'kv:getCachedData': null,
      'r2:getFile': null,
      'r2:listFiles': [],
      'durable-objects:getState': null,
    };

    const key = `${service}:${operation}`;
    return defaults[key] || null;
  }

  /**
   * Initialize local fallback data
   */
  private initializeLocalFallbacks(): void {
    // Configuration fallbacks
    this.localFallbacks.set('kv:getConfig', {
      llmSettings: {
        defaultModel: 'google/gemini-2.0-flash-exp',
        fallbackModels: ['anthropic/claude-3-haiku', 'openai/gpt-4o-mini'],
        maxTokens: 4096,
        temperature: 0.7,
      },
      featureFlags: {
        voiceInputEnabled: false,
        advancedAnalytics: true,
        debugMode: false,
      },
      businessRules: {
        maxStopoverDuration: 4,
        availableCategories: ['standard', 'premium', 'premium-beach', 'luxury'],
        pricingMultipliers: {
          standard: 1.0,
          premium: 1.875,
          'premium-beach': 2.6875,
          luxury: 3.75,
        },
      },
    });

    // Asset URL fallbacks (using local assets as fallback)
    this.localFallbacks.set('r2:getAssetUrl', {
      'logos/qatar-airways-logo.png': '/src/assets/images/Qatar-Airways-Logo.png',
      'logos/privilege-club-logo.png': '/src/assets/images/privilege_club_logo.png',
      'hotels/millenium_hotel.webp': '/src/assets/images/millenium_hotel.webp',
      'hotels/steigenberger_hotel.webp': '/src/assets/images/steigenberger_hotel.webp',
      'hotels/souq_waqif_hotel.webp': '/src/assets/images/souq_waqif_hotel.webp',
      'hotels/crowne_plaza_hotel.webp': '/src/assets/images/crowne_plaza_hotel.webp',
      'hotels/al_najada_hotel.webp': '/src/assets/images/al_najada_hotel.webp',
      'categories/standard_stopover.jpg': '/src/assets/images/standard_stopover.jpg',
      'categories/premium_stopover.jpg': '/src/assets/images/premium_stopover.jpg',
      'categories/premium_beach_stopover.jpg': '/src/assets/images/premium_beach_stopover.jpg',
      'categories/luxury_stopover.jpg': '/src/assets/images/luxury_stopover.jpg',
      'tours/whale sharks of qatar.jpg': '/src/assets/images/whale sharks of qatar.jpg',
      'tours/shale_shark.webp': '/src/assets/images/shale_shark.webp',
    });

    // Conversation state fallbacks
    this.localFallbacks.set('durable-objects:getState', {
      conversationId: 'fallback-conversation',
      messages: [],
      bookingState: {},
      currentStep: 'welcome',
      lastActivity: Date.now(),
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byService: Record<string, number>;
    byOperation: Record<string, number>;
    recentErrors: DataServiceError[];
  } {
    const byService: Record<string, number> = {};
    const byOperation: Record<string, number> = {};

    this.errors.forEach(error => {
      byService[error.service] = (byService[error.service] || 0) + 1;
      byOperation[error.operation] = (byOperation[error.operation] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byService,
      byOperation,
      recentErrors: this.errors.slice(-10),
    };
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Check service health based on recent errors
   */
  getServiceHealth(): Record<string, 'healthy' | 'degraded' | 'unhealthy'> {
    const now = Date.now();
    const recentWindow = 5 * 60 * 1000; // 5 minutes
    
    const recentErrors = this.errors.filter(
      error => now - error.timestamp < recentWindow
    );

    const services = ['kv', 'r2', 'durable-objects'];
    const health: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};

    services.forEach(service => {
      const serviceErrors = recentErrors.filter(error => error.service === service);
      
      if (serviceErrors.length === 0) {
        health[service] = 'healthy';
      } else if (serviceErrors.length < 5) {
        health[service] = 'degraded';
      } else {
        health[service] = 'unhealthy';
      }
    });

    return health;
  }
}

/**
 * Create error handler instance
 */
export function createErrorHandler(config?: Partial<FallbackConfig>): DataServiceErrorHandler {
  return new DataServiceErrorHandler(config);
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = createErrorHandler();