/**
 * Performance Monitoring Utilities
 * Qatar Airways Stopover AI Agent
 */

import { analytics, logger } from './monitoring';

export interface PerformanceTimer {
  start(): void;
  end(): number;
  mark(label: string): void;
  measure(startMark: string, endMark: string): number;
}

export interface WebVitalsMetrics {
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private marks: Map<string, number> = new Map();

  /**
   * Create a performance timer for measuring operations
   */
  createTimer(name: string): PerformanceTimer {
    return {
      start: () => {
        this.timers.set(name, performance.now());
        logger.debug(`Performance timer started: ${name}`);
      },
      
      end: () => {
        const startTime = this.timers.get(name);
        if (!startTime) {
          logger.warn(`Performance timer not found: ${name}`);
          return 0;
        }
        
        const duration = performance.now() - startTime;
        this.timers.delete(name);
        
        analytics.trackPerformance(name, duration, 'ms');
        logger.debug(`Performance timer ended: ${name} = ${duration.toFixed(2)}ms`);
        
        return duration;
      },
      
      mark: (label: string) => {
        const markName = `${name}_${label}`;
        this.marks.set(markName, performance.now());
        logger.debug(`Performance mark: ${markName}`);
      },
      
      measure: (startMark: string, endMark: string) => {
        const startTime = this.marks.get(`${name}_${startMark}`);
        const endTime = this.marks.get(`${name}_${endMark}`);
        
        if (!startTime || !endTime) {
          logger.warn(`Performance marks not found: ${startMark} or ${endMark}`);
          return 0;
        }
        
        const duration = endTime - startTime;
        const measureName = `${name}_${startMark}_to_${endMark}`;
        
        analytics.trackPerformance(measureName, duration, 'ms');
        logger.debug(`Performance measure: ${measureName} = ${duration.toFixed(2)}ms`);
        
        return duration;
      }
    };
  }

  /**
   * Measure LLM response performance
   */
  measureLLMResponse<T>(
    operation: () => Promise<T>,
    model: string,
    context?: Record<string, any>
  ): Promise<T> {
    const timer = this.createTimer('llm_response');
    timer.start();
    
    const startTime = Date.now();
    
    return operation()
      .then((result) => {
        const duration = timer.end();
        
        analytics.trackLLM({
          model,
          tokensUsed: 0, // Will be updated by actual LLM call
          responseTime: duration,
          success: true,
          ...context,
        });
        
        return result;
      })
      .catch((error) => {
        const duration = timer.end();
        
        analytics.trackLLM({
          model,
          tokensUsed: 0,
          responseTime: duration,
          success: false,
          ...context,
        });
        
        throw error;
      });
  }

  /**
   * Measure component render performance
   */
  measureComponentRender(componentName: string, renderFn: () => void): void {
    const timer = this.createTimer(`component_render_${componentName}`);
    timer.start();
    
    renderFn();
    
    timer.end();
  }

  /**
   * Measure API request performance
   */
  async measureAPIRequest<T>(
    url: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const timer = this.createTimer(`api_request_${url.replace(/[^a-zA-Z0-9]/g, '_')}`);
    timer.start();
    
    try {
      const result = await requestFn();
      const duration = timer.end();
      
      analytics.track('api_request_completed', {
        url,
        duration,
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = timer.end();
      
      analytics.track('api_request_completed', {
        url,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  /**
   * Monitor Web Vitals metrics
   */
  monitorWebVitals(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Monitor Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // Monitor First Input Delay (FID)
    this.observeFID();
    
    // Monitor Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Monitor First Contentful Paint (FCP)
    this.observeFCP();
    
    // Monitor Time to First Byte (TTFB)
    this.observeTTFB();
  }

  private observeLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        analytics.trackPerformance('web_vitals_lcp', lastEntry.startTime, 'ms', {
          element: (lastEntry as any).element?.tagName,
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private observeFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          analytics.trackPerformance('web_vitals_fid', entry.processingStart - entry.startTime, 'ms');
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private observeCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        analytics.trackPerformance('web_vitals_cls', clsValue, 'count');
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private observeFCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            analytics.trackPerformance('web_vitals_fcp', entry.startTime, 'ms');
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }

  private observeTTFB(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        analytics.trackPerformance('web_vitals_ttfb', ttfb, 'ms');
      }
    }
  }

  /**
   * Monitor resource loading performance
   */
  monitorResourceLoading(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          
          analytics.trackPerformance('resource_load_time', resource.duration, 'ms', {
            resourceType: resource.initiatorType,
            resourceName: resource.name,
            transferSize: resource.transferSize,
          });
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memoryUsed = memory.usedJSHeapSize;
        metrics.memoryTotal = memory.totalJSHeapSize;
        metrics.memoryLimit = memory.jsHeapSizeLimit;
      }
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
      }
    }
    
    return metrics;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const measurePerformance = {
  timer: (name: string) => performanceMonitor.createTimer(name),
  llm: <T>(operation: () => Promise<T>, model: string, context?: Record<string, any>) => 
    performanceMonitor.measureLLMResponse(operation, model, context),
  component: (name: string, renderFn: () => void) => 
    performanceMonitor.measureComponentRender(name, renderFn),
  api: <T>(url: string, requestFn: () => Promise<T>) => 
    performanceMonitor.measureAPIRequest(url, requestFn),
};

// Initialize monitoring on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.monitorWebVitals();
    performanceMonitor.monitorResourceLoading();
    
    // Log initial performance metrics
    const metrics = performanceMonitor.getCurrentMetrics();
    logger.info('Initial performance metrics', metrics);
  });
}