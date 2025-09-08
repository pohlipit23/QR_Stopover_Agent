/**
 * Security Utilities and Middleware
 * Qatar Airways Stopover AI Agent
 */

import { logger } from './monitoring';

export interface SecurityConfig {
  corsOrigins: string[];
  csrfProtection: boolean;
  rateLimiting: {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstSize: number;
  };
  securityHeaders: boolean;
}

export interface RateLimitState {
  requests: number;
  windowStart: number;
  blocked: boolean;
}

class SecurityService {
  private config: SecurityConfig;
  private rateLimitStore: Map<string, RateLimitState> = new Map();

  constructor() {
    this.config = {
      corsOrigins: this.parseOrigins(this.getEnvVar('CORS_ORIGINS', '')),
      csrfProtection: this.getEnvVar('CSRF_PROTECTION_ENABLED', 'true') === 'true',
      rateLimiting: {
        requestsPerMinute: parseInt(this.getEnvVar('RATE_LIMIT_REQUESTS_PER_MINUTE', '60')),
        requestsPerHour: parseInt(this.getEnvVar('RATE_LIMIT_REQUESTS_PER_HOUR', '1000')),
        burstSize: parseInt(this.getEnvVar('RATE_LIMIT_BURST_SIZE', '10')),
      },
      securityHeaders: this.getEnvVar('SECURITY_HEADERS_ENABLED', 'true') === 'true',
    };
  }

  private getEnvVar(key: string, defaultValue: string): string {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  }

  private parseOrigins(originsString: string): string[] {
    if (!originsString) {
      return ['http://localhost:4321', 'http://localhost:3000'];
    }
    return originsString.split(',').map(origin => origin.trim());
  }

  /**
   * Validate CORS origin
   */
  validateCorsOrigin(origin: string): boolean {
    if (!origin) {
      return false;
    }

    // Allow localhost in development
    if (this.getEnvVar('NODE_ENV', 'development') === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
      }
    }

    return this.config.corsOrigins.includes(origin);
  }

  /**
   * Get CORS headers
   */
  getCorsHeaders(origin?: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (origin && this.validateCorsOrigin(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    } else {
      headers['Access-Control-Allow-Origin'] = this.config.corsOrigins[0] || 'https://localhost:4321';
    }

    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Max-Age'] = '86400';

    return headers;
  }

  /**
   * Get security headers
   */
  getSecurityHeaders(): Record<string, string> {
    if (!this.config.securityHeaders) {
      return {};
    }

    return {
      // Prevent XSS attacks
      'X-XSS-Protection': '1; mode=block',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Enforce HTTPS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Content Security Policy
      'Content-Security-Policy': this.getCSPHeader(),
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
  }

  private getCSPHeader(): string {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://openrouter.ai",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://openrouter.ai https://api.openai.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ];

    return csp.join('; ');
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowDuration = 60 * 1000; // 1 minute
    
    let state = this.rateLimitStore.get(clientId);
    
    if (!state || now - state.windowStart > windowDuration) {
      // New window or expired window
      state = {
        requests: 0,
        windowStart: now,
        blocked: false,
      };
    }

    state.requests++;
    
    const allowed = state.requests <= this.config.rateLimiting.requestsPerMinute;
    
    if (!allowed) {
      state.blocked = true;
      logger.warn(`Rate limit exceeded for client: ${clientId}`, {
        requests: state.requests,
        limit: this.config.rateLimiting.requestsPerMinute,
      });
    }

    this.rateLimitStore.set(clientId, state);

    return {
      allowed,
      remaining: Math.max(0, this.config.rateLimiting.requestsPerMinute - state.requests),
      resetTime: state.windowStart + windowDuration,
    };
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate API request
   */
  validateApiRequest(request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check content type for POST requests
    if (request.method === 'POST' && request.body) {
      const contentType = request.headers['content-type'] || request.headers['Content-Type'];
      if (!contentType || !contentType.includes('application/json')) {
        errors.push('Invalid content type. Expected application/json');
      }
    }

    // Check for required headers
    if (!request.headers['user-agent'] && !request.headers['User-Agent']) {
      logger.warn('Request missing User-Agent header');
    }

    // Validate request size
    if (request.body) {
      const bodySize = JSON.stringify(request.body).length;
      const maxSize = 1024 * 1024; // 1MB
      
      if (bodySize > maxSize) {
        errors.push(`Request body too large: ${bodySize} bytes (max: ${maxSize})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for environments without crypto.randomUUID
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!this.config.csrfProtection) {
      return true;
    }

    return token === expectedToken;
  }

  /**
   * Get client identifier for rate limiting
   */
  getClientId(request: {
    headers: Record<string, string>;
    ip?: string;
  }): string {
    // Use IP address as primary identifier
    if (request.ip) {
      return request.ip;
    }

    // Fallback to headers
    const forwarded = request.headers['x-forwarded-for'] || request.headers['X-Forwarded-For'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'] || request.headers['X-Real-IP'];
    if (realIp) {
      return realIp;
    }

    // Last resort: use user agent hash
    const userAgent = request.headers['user-agent'] || request.headers['User-Agent'] || 'unknown';
    return this.hashString(userAgent);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Clean up expired rate limit entries
   */
  cleanupRateLimitStore(): void {
    const now = Date.now();
    const windowDuration = 60 * 1000; // 1 minute

    for (const [clientId, state] of this.rateLimitStore.entries()) {
      if (now - state.windowStart > windowDuration) {
        this.rateLimitStore.delete(clientId);
      }
    }
  }
}

// Create singleton instance
export const security = new SecurityService();

// Middleware function for API routes
export function securityMiddleware(request: Request): {
  allowed: boolean;
  headers: Record<string, string>;
  errors?: string[];
} {
  const url = new URL(request.url);
  const origin = request.headers.get('origin') || '';
  
  // Get client ID for rate limiting
  const clientId = security.getClientId({
    headers: Object.fromEntries(request.headers.entries()),
    ip: request.headers.get('cf-connecting-ip') || undefined,
  });

  // Check rate limiting
  const rateLimit = security.checkRateLimit(clientId);
  
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      headers: {
        ...security.getCorsHeaders(origin),
        'X-RateLimit-Limit': security['config'].rateLimiting.requestsPerMinute.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
      errors: ['Rate limit exceeded'],
    };
  }

  // Validate request
  const validation = security.validateApiRequest({
    method: request.method,
    url: url.pathname,
    headers: Object.fromEntries(request.headers.entries()),
  });

  if (!validation.valid) {
    return {
      allowed: false,
      headers: security.getCorsHeaders(origin),
      errors: validation.errors,
    };
  }

  // Return success with security headers
  return {
    allowed: true,
    headers: {
      ...security.getCorsHeaders(origin),
      ...security.getSecurityHeaders(),
      'X-RateLimit-Limit': security['config'].rateLimiting.requestsPerMinute.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString(),
    },
  };
}

// Cleanup interval (run every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    security.cleanupRateLimitStore();
  }, 5 * 60 * 1000);
}