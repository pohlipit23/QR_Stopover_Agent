/**
 * Deployment Configuration
 * Qatar Airways Stopover AI Agent
 */

const deploymentConfig = {
  // Environment-specific configurations
  environments: {
    development: {
      name: 'qatar-stopover-ai-agent-dev',
      domain: 'localhost:4321',
      apiUrl: 'http://localhost:4321/api',
      cdnEnabled: false,
      minification: false,
      compression: false,
      monitoring: {
        enabled: false,
        logLevel: 'debug',
      },
      security: {
        corsOrigins: ['http://localhost:4321', 'http://localhost:3000'],
        rateLimiting: false,
      },
    },
    
    staging: {
      name: 'qatar-stopover-ai-agent-staging',
      domain: 'qatar-stopover-ai-agent-staging.pages.dev',
      apiUrl: 'https://qatar-stopover-ai-agent-staging.pages.dev/api',
      cdnEnabled: true,
      minification: false,
      compression: true,
      monitoring: {
        enabled: true,
        logLevel: 'debug',
        analytics: true,
        errorReporting: true,
      },
      security: {
        corsOrigins: [
          'https://qatar-stopover-ai-agent-staging.pages.dev',
          'https://staging.your-domain.com'
        ],
        rateLimiting: true,
        securityHeaders: true,
      },
      performance: {
        caching: {
          staticAssets: 3600, // 1 hour
          apiResponses: 60,   // 1 minute
        },
      },
    },
    
    production: {
      name: 'qatar-stopover-ai-agent-production',
      domain: 'qatar-stopover-ai-agent.pages.dev',
      customDomain: 'your-custom-domain.com',
      apiUrl: 'https://qatar-stopover-ai-agent.pages.dev/api',
      cdnEnabled: true,
      minification: true,
      compression: true,
      monitoring: {
        enabled: true,
        logLevel: 'info',
        analytics: true,
        errorReporting: true,
        performanceMonitoring: true,
      },
      security: {
        corsOrigins: [
          'https://qatar-stopover-ai-agent.pages.dev',
          'https://your-custom-domain.com'
        ],
        rateLimiting: true,
        securityHeaders: true,
        csrfProtection: true,
      },
      performance: {
        caching: {
          staticAssets: 31536000, // 1 year
          apiResponses: 300,      // 5 minutes
        },
        optimization: {
          imageOptimization: true,
          lazyLoading: true,
          preloading: true,
        },
      },
    },
  },

  // Build configurations
  build: {
    outputDir: 'dist',
    assetsDir: 'assets',
    publicDir: 'public',
    
    optimization: {
      minifyCSS: true,
      minifyJS: true,
      minifyHTML: true,
      treeshaking: true,
      bundleAnalysis: false,
    },
    
    compatibility: {
      target: 'es2020',
      polyfills: false,
    },
  },

  // Cloudflare Pages specific configuration
  cloudflare: {
    pages: {
      buildCommand: 'npm run build',
      buildOutputDirectory: 'dist',
      rootDirectory: '.',
      
      // Environment variables that should be set in Cloudflare dashboard
      requiredEnvVars: [
        'OPENROUTER_API_KEY',
        'DEFAULT_MODEL',
        'ENVIRONMENT',
        'NODE_ENV',
      ],
      
      // Optional environment variables
      optionalEnvVars: [
        'SENTRY_DSN',
        'ANALYTICS_ENABLED',
        'PERFORMANCE_MONITORING_ENABLED',
        'CF_ZONE_ID',
        'CF_ACCOUNT_ID',
      ],
    },
    
    // Functions configuration
    functions: {
      compatibility_date: '2024-10-01',
      compatibility_flags: ['nodejs_compat'],
      
      // KV namespaces (for future use)
      kvNamespaces: [
        {
          binding: 'QATAR_STOPOVER_KV',
          id: 'your_kv_namespace_id',
          preview_id: 'your_kv_preview_id',
        },
      ],
      
      // D1 databases (for future use)
      d1Databases: [
        {
          binding: 'QATAR_STOPOVER_DB',
          database_name: 'qatar-stopover-db',
          database_id: 'your_d1_database_id',
        },
      ],
      
      // R2 buckets (for future use)
      r2Buckets: [
        {
          binding: 'QATAR_STOPOVER_ASSETS',
          bucket_name: 'qatar-stopover-assets',
        },
      ],
    },
  },

  // Monitoring and analytics configuration
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.ENVIRONMENT || 'development',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
    },
    
    analytics: {
      enabled: process.env.ANALYTICS_ENABLED === 'true',
      trackingId: process.env.ANALYTICS_TRACKING_ID,
    },
    
    performance: {
      enabled: process.env.PERFORMANCE_MONITORING_ENABLED === 'true',
      webVitals: true,
      resourceTiming: true,
    },
  },

  // Security configuration
  security: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://openrouter.ai'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': ["'self'", 'https://openrouter.ai', 'https://api.openai.com'],
    },
  },

  // Performance optimization
  performance: {
    caching: {
      strategies: {
        static: 'cache-first',
        api: 'network-first',
        images: 'cache-first',
      },
    },
    
    compression: {
      gzip: true,
      brotli: true,
    },
    
    optimization: {
      imageFormats: ['webp', 'avif'],
      lazyLoading: true,
      preloading: ['fonts', 'critical-css'],
    },
  },
};

module.exports = deploymentConfig;