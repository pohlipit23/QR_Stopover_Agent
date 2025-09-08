# Deployment Guide
Qatar Airways Stopover AI Agent

## Overview

This guide covers the deployment process for the Qatar Airways Stopover AI Agent to Cloudflare Pages with production-ready configurations.

## Prerequisites

### Required Tools
- Node.js 18+ and npm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Pages access
- OpenRouter API account and key

### Required Accounts
1. **Cloudflare Account**
   - Pages subscription
   - Custom domain (optional)
   - Analytics access

2. **OpenRouter Account**
   - API key for LLM access
   - Sufficient credits for production usage

3. **Monitoring Services (Optional)**
   - Sentry account for error reporting
   - Analytics service (Google Analytics, etc.)

## Environment Setup

### 1. Environment Variables

#### Production Environment Variables
Set these in the Cloudflare Pages dashboard under Settings > Environment Variables:

```bash
# Core Configuration
ENVIRONMENT=production
NODE_ENV=production

# LLM Configuration
OPENROUTER_API_KEY=your_production_openrouter_api_key
DEFAULT_MODEL=google/gemini-2.0-flash-exp
FALLBACK_MODELS=anthropic/claude-3-haiku,openai/gpt-4o-mini
MAX_TOKENS=4096
TEMPERATURE=0.7

# Conversation Limits
MAX_CONTEXT_MESSAGES=15
CONTEXT_WINDOW_TOKENS=80000
FUNCTION_CALLING_ENABLED=true
STREAMING_ENABLED=true

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
RATE_LIMIT_BURST_SIZE=10

# Monitoring
ANALYTICS_ENABLED=true
PERFORMANCE_MONITORING_ENABLED=true
ERROR_REPORTING_ENABLED=true
SENTRY_DSN=your_sentry_dsn_here

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_LOGGING=true
ENABLE_PERFORMANCE_LOGGING=true

# Security
CORS_ORIGINS=https://qatar-stopover-ai-agent.pages.dev,https://your-custom-domain.com
CSRF_PROTECTION_ENABLED=true
SECURITY_HEADERS_ENABLED=true

# Performance
CACHE_TTL_STATIC_ASSETS=31536000
CACHE_TTL_API_RESPONSES=300
CACHE_TTL_LLM_RESPONSES=0
CDN_ENABLED=true
COMPRESSION_ENABLED=true
MINIFICATION_ENABLED=true
IMAGE_OPTIMIZATION_ENABLED=true
LAZY_LOADING_ENABLED=true

# Feature Flags
FEATURE_VOICE_INPUT=false
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_A_B_TESTING=false
FEATURE_DEBUG_MODE=false

# Cloudflare
CF_ZONE_ID=your_cloudflare_zone_id
CF_ACCOUNT_ID=your_cloudflare_account_id
```

#### Staging Environment Variables
Similar to production but with different values for testing:

```bash
ENVIRONMENT=staging
LOG_LEVEL=debug
FEATURE_DEBUG_MODE=true
RATE_LIMIT_REQUESTS_PER_MINUTE=120
# ... other staging-specific values
```

### 2. Secrets Management

#### Sensitive Variables (Set as Encrypted)
- `OPENROUTER_API_KEY`
- `SENTRY_DSN`
- `CF_ZONE_ID`
- `CF_ACCOUNT_ID`

## Deployment Process

### 1. Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] API keys are valid and have sufficient credits
- [ ] Custom domain configured (if applicable)

### 2. Staging Deployment

```bash
# Build for staging
npm run build:staging

# Deploy to staging
npm run deploy:staging

# Or manually with wrangler
wrangler pages deploy dist --env staging
```

### 3. Production Deployment

```bash
# Build for production
npm run build:production

# Deploy to production
npm run deploy:production

# Or manually with wrangler
wrangler pages deploy dist --env production
```

### 4. Custom Domain Setup (Optional)

1. **Add Custom Domain in Cloudflare Pages**
   - Go to Pages > Your Project > Custom Domains
   - Add your domain (e.g., `stopover.qatarairways.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Add custom domain to `CORS_ORIGINS`
   - Update any hardcoded URLs

3. **SSL Certificate**
   - Cloudflare automatically provisions SSL certificates
   - Verify HTTPS is working correctly

## Post-Deployment Verification

### 1. Functional Testing

- [ ] Application loads correctly
- [ ] Chat interface initializes
- [ ] LLM responses are working
- [ ] All interactive components function
- [ ] Payment flow works (mock data)
- [ ] Mobile responsiveness verified

### 2. Performance Testing

- [ ] Page load times < 3 seconds
- [ ] LLM response times < 10 seconds
- [ ] Images load efficiently
- [ ] CDN caching working
- [ ] Compression enabled

### 3. Security Testing

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS configured correctly
- [ ] Rate limiting functional
- [ ] No sensitive data exposed

### 4. Monitoring Verification

- [ ] Error reporting working
- [ ] Analytics tracking events
- [ ] Performance metrics collected
- [ ] Logs being generated

## Monitoring and Maintenance

### 1. Performance Monitoring

#### Key Metrics to Monitor
- **Response Times**: API endpoints < 2s, LLM responses < 10s
- **Error Rates**: < 1% for API calls, < 5% for LLM calls
- **Availability**: > 99.9% uptime
- **Resource Usage**: Memory, CPU, bandwidth

#### Monitoring Tools
- Cloudflare Analytics (built-in)
- Sentry for error tracking
- Custom performance monitoring via monitoring.ts

### 2. Log Analysis

#### Log Locations
- Cloudflare Pages Functions logs
- Wrangler tail for real-time logs
- Sentry for error aggregation

#### Key Log Events
- LLM API failures and fallbacks
- Rate limiting triggers
- Security violations
- Performance bottlenecks

### 3. Maintenance Tasks

#### Daily
- [ ] Check error rates in Sentry
- [ ] Monitor LLM API usage and costs
- [ ] Review performance metrics

#### Weekly
- [ ] Analyze user journey completion rates
- [ ] Review and optimize slow queries
- [ ] Update dependencies if needed

#### Monthly
- [ ] Security audit and updates
- [ ] Performance optimization review
- [ ] Cost analysis and optimization

## Troubleshooting

### Common Issues

#### 1. LLM API Failures
**Symptoms**: Chat not responding, error messages
**Solutions**:
- Check OpenRouter API key validity
- Verify API credits/quota
- Check model availability
- Review fallback model configuration

#### 2. Performance Issues
**Symptoms**: Slow loading, timeouts
**Solutions**:
- Check CDN cache hit rates
- Optimize image sizes and formats
- Review and optimize API response times
- Enable compression if not active

#### 3. Security Blocks
**Symptoms**: Requests being blocked, CORS errors
**Solutions**:
- Verify CORS origins configuration
- Check rate limiting settings
- Review security headers
- Validate SSL certificate

#### 4. Deployment Failures
**Symptoms**: Build errors, deployment timeouts
**Solutions**:
- Check build logs for errors
- Verify environment variables
- Ensure all dependencies are installed
- Check Cloudflare service status

### Emergency Procedures

#### 1. Rollback Deployment
```bash
# List recent deployments
wrangler pages deployment list

# Rollback to previous deployment
wrangler pages deployment rollback <deployment-id>
```

#### 2. Emergency Maintenance Mode
- Update environment variable `MAINTENANCE_MODE=true`
- Deploy maintenance page
- Communicate with stakeholders

#### 3. API Key Rotation
1. Generate new OpenRouter API key
2. Update environment variable in Cloudflare
3. Test functionality
4. Revoke old API key

## Performance Optimization

### 1. Caching Strategy

#### Static Assets
- Images: 1 year cache
- CSS/JS: 1 day cache with versioning
- HTML: 5 minutes cache

#### API Responses
- Static data: 1 hour cache
- Dynamic data: 5 minutes cache
- LLM responses: No cache

### 2. Image Optimization

- Use WebP format with fallbacks
- Implement lazy loading
- Optimize image sizes for different devices
- Use Cloudflare Image Resizing (if available)

### 3. Code Optimization

- Enable minification in production
- Use tree shaking for unused code
- Implement code splitting for large bundles
- Optimize LLM prompt lengths

## Security Best Practices

### 1. API Security

- Use HTTPS everywhere
- Implement proper CORS policies
- Enable rate limiting
- Validate all inputs
- Use secure headers

### 2. Data Protection

- No PII in logs
- Secure API key storage
- Regular security audits
- Monitor for suspicious activity

### 3. Access Control

- Principle of least privilege
- Regular access reviews
- Strong authentication for admin access
- Audit trails for all changes

## Cost Optimization

### 1. LLM Usage

- Monitor token usage
- Optimize prompt efficiency
- Use appropriate model tiers
- Implement caching where possible

### 2. Cloudflare Costs

- Monitor bandwidth usage
- Optimize cache hit rates
- Use appropriate service tiers
- Regular cost reviews

### 3. Resource Optimization

- Minimize bundle sizes
- Optimize images and assets
- Use efficient algorithms
- Monitor and optimize database queries (future)

## Support and Documentation

### Internal Documentation
- Architecture documentation
- API documentation
- Troubleshooting guides
- Runbooks for common tasks

### External Resources
- Cloudflare Pages documentation
- OpenRouter API documentation
- Astro framework documentation
- React component library documentation

### Contact Information
- Development team: [team-email]
- DevOps/Infrastructure: [devops-email]
- Emergency contact: [emergency-contact]

---

## Deployment Checklist Summary

### Pre-Deployment
- [ ] Code review completed
- [ ] Tests passing
- [ ] Environment variables configured
- [ ] API keys validated
- [ ] Performance testing completed

### Deployment
- [ ] Staging deployment successful
- [ ] Staging testing completed
- [ ] Production deployment executed
- [ ] DNS/domain configuration verified

### Post-Deployment
- [ ] Functional testing completed
- [ ] Performance metrics verified
- [ ] Security testing completed
- [ ] Monitoring configured and working
- [ ] Documentation updated
- [ ] Team notified of deployment

This deployment guide ensures a smooth, secure, and monitored deployment of the Qatar Airways Stopover AI Agent to production.