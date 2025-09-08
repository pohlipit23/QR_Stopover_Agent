/**
 * CDN and Caching Configuration
 * Qatar Airways Stopover AI Agent
 */

import { logger } from './monitoring';

export interface CacheConfig {
  staticAssets: number;
  apiResponses: number;
  llmResponses: number;
  enabled: boolean;
}

export interface CacheHeaders {
  'Cache-Control': string;
  'CDN-Cache-Control'?: string;
  'Cloudflare-CDN-Cache-Control'?: string;
  'Vary'?: string;
  'ETag'?: string;
  'Last-Modified'?: string;
}

class CachingService {
  private config: CacheConfig;

  constructor() {
    this.config = {
      staticAssets: parseInt(this.getEnvVar('CACHE_TTL_STATIC_ASSETS', '31536000')), // 1 year
      apiResponses: parseInt(this.getEnvVar('CACHE_TTL_API_RESPONSES', '300')), // 5 minutes
      llmResponses: parseInt(this.getEnvVar('CACHE_TTL_LLM_RESPONSES', '0')), // No cache
      enabled: this.getEnvVar('CDN_ENABLED', 'true') === 'true',
    };
  }

  private getEnvVar(key: string, defaultValue: string): string {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  }

  /**
   * Get cache headers for static assets
   */
  getStaticAssetHeaders(filePath: string): CacheHeaders {
    if (!this.config.enabled) {
      return { 'Cache-Control': 'no-cache' };
    }

    const extension = filePath.split('.').pop()?.toLowerCase();
    let maxAge = this.config.staticAssets;

    // Different cache times for different asset types
    switch (extension) {
      case 'html':
        maxAge = 300; // 5 minutes for HTML
        break;
      case 'css':
      case 'js':
        maxAge = 86400; // 1 day for CSS/JS
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'svg':
      case 'ico':
        maxAge = this.config.staticAssets; // 1 year for images
        break;
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'eot':
        maxAge = this.config.staticAssets; // 1 year for fonts
        break;
      default:
        maxAge = 3600; // 1 hour for other files
    }

    const headers: CacheHeaders = {
      'Cache-Control': `public, max-age=${maxAge}, immutable`,
      'CDN-Cache-Control': `public, max-age=${maxAge}`,
    };

    // Add Vary header for responsive images
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
      headers['Vary'] = 'Accept';
    }

    return headers;
  }

  /**
   * Get cache headers for API responses
   */
  getApiResponseHeaders(endpoint: string, dynamic: boolean = false): CacheHeaders {
    if (!this.config.enabled || dynamic) {
      return { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
    }

    let maxAge = this.config.apiResponses;

    // Different cache times for different endpoints
    if (endpoint.includes('/chat')) {
      maxAge = this.config.llmResponses; // No cache for chat
    } else if (endpoint.includes('/static-data')) {
      maxAge = 3600; // 1 hour for static data
    }

    if (maxAge === 0) {
      return { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
    }

    return {
      'Cache-Control': `public, max-age=${maxAge}`,
      'CDN-Cache-Control': `public, max-age=${maxAge}`,
      'Vary': 'Accept-Encoding',
    };
  }

  /**
   * Get cache headers for LLM responses (typically no cache)
   */
  getLLMResponseHeaders(): CacheHeaders {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Vary': 'Accept-Encoding',
    };
  }

  /**
   * Generate ETag for content
   */
  generateETag(content: string | Buffer): string {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Use Web Crypto API if available
      const encoder = new TextEncoder();
      const data = typeof content === 'string' ? encoder.encode(content) : content;
      
      return crypto.subtle.digest('SHA-256', data).then(hash => {
        const hashArray = Array.from(new Uint8Array(hash));
        return '"' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + '"';
      }).catch(() => this.fallbackETag(content));
    }
    
    return this.fallbackETag(content);
  }

  private fallbackETag(content: string | Buffer): string {
    // Simple hash function for ETag generation
    const str = typeof content === 'string' ? content : content.toString();
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return '"' + Math.abs(hash).toString(16) + '"';
  }

  /**
   * Check if content is modified based on ETag or Last-Modified
   */
  isModified(
    requestHeaders: Record<string, string>,
    etag?: string,
    lastModified?: Date
  ): boolean {
    const ifNoneMatch = requestHeaders['if-none-match'];
    const ifModifiedSince = requestHeaders['if-modified-since'];

    // Check ETag
    if (etag && ifNoneMatch) {
      return ifNoneMatch !== etag;
    }

    // Check Last-Modified
    if (lastModified && ifModifiedSince) {
      const modifiedSince = new Date(ifModifiedSince);
      return lastModified > modifiedSince;
    }

    // If no conditional headers, assume modified
    return true;
  }

  /**
   * Get Cloudflare-specific cache headers
   */
  getCloudflareHeaders(cacheLevel: 'aggressive' | 'standard' | 'bypass' = 'standard'): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (cacheLevel) {
      case 'aggressive':
        headers['CF-Cache-Status'] = 'HIT';
        headers['CF-Cache-Tag'] = 'static-assets';
        break;
      case 'standard':
        headers['CF-Cache-Tag'] = 'api-responses';
        break;
      case 'bypass':
        headers['CF-Cache-Status'] = 'BYPASS';
        break;
    }

    return headers;
  }

  /**
   * Purge cache for specific patterns
   */
  async purgeCache(patterns: string[]): Promise<void> {
    // This would integrate with Cloudflare's cache purge API
    logger.info('Cache purge requested', { patterns });
    
    // In a real implementation, this would make API calls to Cloudflare
    // For now, just log the purge request
    patterns.forEach(pattern => {
      logger.debug(`Purging cache for pattern: ${pattern}`);
    });
  }

  /**
   * Get compression headers
   */
  getCompressionHeaders(): Record<string, string> {
    const compressionEnabled = this.getEnvVar('COMPRESSION_ENABLED', 'true') === 'true';
    
    if (!compressionEnabled) {
      return {};
    }

    return {
      'Content-Encoding': 'gzip',
      'Vary': 'Accept-Encoding',
    };
  }

  /**
   * Get cache configuration for different content types
   */
  getCacheStrategy(contentType: string): {
    maxAge: number;
    staleWhileRevalidate: number;
    cacheLevel: 'aggressive' | 'standard' | 'bypass';
  } {
    if (contentType.includes('text/html')) {
      return {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 3600, // 1 hour
        cacheLevel: 'standard',
      };
    }

    if (contentType.includes('application/javascript') || contentType.includes('text/css')) {
      return {
        maxAge: 86400, // 1 day
        staleWhileRevalidate: 604800, // 1 week
        cacheLevel: 'aggressive',
      };
    }

    if (contentType.includes('image/')) {
      return {
        maxAge: this.config.staticAssets, // 1 year
        staleWhileRevalidate: this.config.staticAssets,
        cacheLevel: 'aggressive',
      };
    }

    if (contentType.includes('application/json')) {
      return {
        maxAge: this.config.apiResponses, // 5 minutes
        staleWhileRevalidate: 1800, // 30 minutes
        cacheLevel: 'standard',
      };
    }

    // Default strategy
    return {
      maxAge: 3600, // 1 hour
      staleWhileRevalidate: 7200, // 2 hours
      cacheLevel: 'standard',
    };
  }
}

// Create singleton instance
export const caching = new CachingService();

// Middleware function for adding cache headers
export function cacheMiddleware(
  request: Request,
  response: {
    headers: Record<string, string>;
    body?: string | Buffer;
  },
  options: {
    contentType?: string;
    dynamic?: boolean;
    endpoint?: string;
  } = {}
): Record<string, string> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  let headers: CacheHeaders;

  // Determine cache strategy based on request type
  if (pathname.startsWith('/api/')) {
    headers = caching.getApiResponseHeaders(pathname, options.dynamic);
  } else if (pathname.match(/\.(css|js|jpg|jpeg|png|webp|svg|ico|woff|woff2|ttf|eot)$/)) {
    headers = caching.getStaticAssetHeaders(pathname);
  } else {
    headers = caching.getApiResponseHeaders(pathname, true); // HTML pages are dynamic
  }

  // Add ETag if response body is available
  if (response.body && !options.dynamic) {
    const etag = caching.generateETag(response.body);
    if (typeof etag === 'string') {
      headers['ETag'] = etag;
    }
  }

  // Add Last-Modified header
  headers['Last-Modified'] = new Date().toUTCString();

  // Add compression headers if enabled
  const compressionHeaders = caching.getCompressionHeaders();
  Object.assign(headers, compressionHeaders);

  // Add Cloudflare-specific headers
  const strategy = caching.getCacheStrategy(options.contentType || 'text/html');
  const cloudflareHeaders = caching.getCloudflareHeaders(strategy.cacheLevel);
  Object.assign(headers, cloudflareHeaders);

  logger.debug('Cache headers applied', {
    pathname,
    headers,
    strategy,
  });

  return headers;
}

// Cache warming function for critical resources
export async function warmCache(urls: string[]): Promise<void> {
  logger.info('Starting cache warming', { urls });

  const promises = urls.map(async (url) => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Qatar-Airways-Cache-Warmer/1.0',
        },
      });

      if (response.ok) {
        logger.debug(`Cache warmed for: ${url}`);
      } else {
        logger.warn(`Failed to warm cache for: ${url}`, { status: response.status });
      }
    } catch (error) {
      logger.error(`Error warming cache for: ${url}`, { error });
    }
  });

  await Promise.allSettled(promises);
  logger.info('Cache warming completed');
}