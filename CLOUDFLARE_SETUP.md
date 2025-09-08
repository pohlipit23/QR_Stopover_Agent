# Cloudflare Data Services Setup Guide

This guide covers the setup and configuration of Cloudflare data services for the Qatar Airways Stopover AI Agent, including KV storage, R2 storage, and Durable Objects.

## Overview

The application uses three Cloudflare data services:

- **KV Store**: Configuration, feature flags, and cached data
- **R2 Storage**: Images and static assets with global CDN
- **Durable Objects**: Conversation state management and booking sessions

## Prerequisites

1. Cloudflare account with Workers/Pages access
2. Wrangler CLI installed and authenticated
3. Node.js 18+ for asset upload scripts

## 1. KV Namespace Setup

### Create KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create "QATAR_STOPOVER_KV"

# Create preview KV namespace for development
wrangler kv:namespace create "QATAR_STOPOVER_KV" --preview
```

### Update wrangler.toml

Replace the placeholder IDs in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "QATAR_STOPOVER_KV"
id = "your_actual_kv_namespace_id"
preview_id = "your_actual_kv_preview_id"
```

### Initialize KV Data

```bash
# Set initial configuration
wrangler kv:key put --binding=QATAR_STOPOVER_KV "app-config" '{
  "llmSettings": {
    "defaultModel": "google/gemini-2.0-flash-exp",
    "fallbackModels": ["anthropic/claude-3-haiku", "openai/gpt-4o-mini"],
    "maxTokens": 4096,
    "temperature": 0.7
  },
  "featureFlags": {
    "voiceInputEnabled": false,
    "advancedAnalytics": true,
    "debugMode": false
  }
}'
```

## 2. R2 Storage Setup

### Create R2 Bucket

```bash
# Create R2 bucket for assets
wrangler r2 bucket create qatar-stopover-assets
```

### Configure Public Access (Optional)

For public asset access, configure custom domain or use R2.dev subdomain:

```bash
# Enable public access (if using R2.dev subdomain)
wrangler r2 bucket cors put qatar-stopover-assets --cors-file cors.json
```

Create `cors.json`:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### Upload Assets

```bash
# Validate all assets are present
npm run assets:validate

# Upload all assets to R2
npm run assets:upload
```

### Custom Domain (Recommended)

1. Add custom domain in Cloudflare dashboard
2. Point to R2 bucket
3. Update `R2_BASE_URL` environment variable

## 3. Durable Objects Setup

Durable Objects are automatically configured through `wrangler.toml`. No additional setup required.

### Verify Durable Objects

```bash
# Deploy to test Durable Objects
wrangler pages deploy dist --env staging
```

## 4. Environment Variables

### Production Environment

Set these in Cloudflare Pages dashboard:

```bash
# LLM Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
DEFAULT_MODEL=google/gemini-2.0-flash-exp
FALLBACK_MODELS=anthropic/claude-3-haiku,openai/gpt-4o-mini

# Asset Configuration
R2_BASE_URL=https://assets.your-domain.com
USE_R2_ASSETS=true

# Feature Flags
FEATURE_VOICE_INPUT=false
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_DEBUG_MODE=false
```

### Development Environment

Create `.env.local`:

```bash
# Development uses local assets by default
USE_R2_ASSETS=false
R2_BASE_URL=

# LLM Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
DEFAULT_MODEL=google/gemini-2.0-flash-exp
```

## 5. Data Service Integration

### KV Store Usage

```typescript
import { createKVStoreManager } from './lib/cloudflare/kv-store';

// Get configuration
const kvStore = createKVStoreManager(env.QATAR_STOPOVER_KV);
const config = await kvStore.getConfig();

// Cache conversation context
await kvStore.cacheConversationContext(conversationId, context);
```

### R2 Storage Usage

```typescript
import { createR2StorageManager } from './lib/cloudflare/r2-storage';

// Get asset URLs
const r2Storage = createR2StorageManager(env.QATAR_STOPOVER_ASSETS);
const hotelImageUrl = r2Storage.getPublicUrl('hotels/millennium_hotel.webp');
```

### Durable Objects Usage

```typescript
// Initialize conversation state
const durableObjectId = env.CONVERSATION_STATE.idFromName(conversationId);
const durableObject = env.CONVERSATION_STATE.get(durableObjectId);

const response = await durableObject.fetch('https://conversation/init', {
  method: 'POST',
  body: JSON.stringify({ conversationId, customerId }),
});
```

## 6. Monitoring and Health Checks

### Health Check Endpoint

```bash
# Check data services health
curl https://your-app.pages.dev/api/data-services?action=health
```

### KV Monitoring

```bash
# List KV keys
wrangler kv:key list --binding=QATAR_STOPOVER_KV

# Get specific key
wrangler kv:key get --binding=QATAR_STOPOVER_KV "app-config"
```

### R2 Monitoring

```bash
# List R2 objects
wrangler r2 object list qatar-stopover-assets

# Get object info
wrangler r2 object info qatar-stopover-assets logos/qatar-airways-logo.png
```

## 7. Error Handling and Fallbacks

The application includes comprehensive error handling:

- **KV Failures**: Falls back to default configuration
- **R2 Failures**: Falls back to local assets
- **Durable Object Failures**: Falls back to stateless operation

### Test Fallbacks

```bash
# Test with KV disabled (simulate failure)
wrangler pages dev dist --kv QATAR_STOPOVER_KV=disabled
```

## 8. Performance Optimization

### Caching Strategy

- **Static Assets**: 1 year cache (31536000 seconds)
- **API Responses**: 5 minutes cache (300 seconds)
- **LLM Responses**: No cache (0 seconds)

### Asset Optimization

```bash
# Enable image optimization in Cloudflare
# Dashboard > Speed > Optimization > Image Optimization: On
```

## 9. Security Configuration

### Access Control

- KV: Worker-only access
- R2: Public read for assets, Worker write access
- Durable Objects: Worker-only access

### CORS Configuration

R2 bucket configured for cross-origin requests from your domain only.

## 10. Deployment Checklist

- [ ] KV namespace created and configured
- [ ] R2 bucket created with assets uploaded
- [ ] Durable Objects configured in wrangler.toml
- [ ] Environment variables set in Cloudflare Pages
- [ ] Custom domain configured for R2 (optional)
- [ ] CORS configured for R2 bucket
- [ ] Health checks passing
- [ ] Error handling tested

## 11. Troubleshooting

### Common Issues

**KV Namespace Not Found**
```bash
# Verify namespace exists
wrangler kv:namespace list
```

**R2 Assets Not Loading**
- Check CORS configuration
- Verify public access settings
- Test asset URLs directly

**Durable Objects Not Working**
- Verify wrangler.toml configuration
- Check deployment logs
- Test with simple fetch request

### Debug Commands

```bash
# View deployment logs
wrangler pages deployment tail

# Test KV access
wrangler kv:key get --binding=QATAR_STOPOVER_KV "app-config"

# Test R2 access
wrangler r2 object get qatar-stopover-assets logos/qatar-airways-logo.png
```

## 12. Cost Optimization

### KV Store
- Free tier: 100,000 reads/day, 1,000 writes/day
- Optimize by caching frequently accessed data

### R2 Storage
- Free tier: 10GB storage, 1M Class A operations/month
- Use appropriate cache headers to minimize requests

### Durable Objects
- Billed per request and CPU time
- Optimize by batching operations and minimizing state changes

## Support

For issues with Cloudflare services:
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)