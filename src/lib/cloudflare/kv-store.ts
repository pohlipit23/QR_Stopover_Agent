/**
 * Cloudflare KV Store utilities for configuration and cached data
 * Provides type-safe access to KV storage with error handling and fallbacks
 */

export interface KVConfig {
  llmSettings: {
    defaultModel: string;
    fallbackModels: string[];
    maxTokens: number;
    temperature: number;
  };
  featureFlags: {
    voiceInputEnabled: boolean;
    advancedAnalytics: boolean;
    debugMode: boolean;
  };
  businessRules: {
    maxStopoverDuration: number;
    availableCategories: string[];
    pricingMultipliers: Record<string, number>;
  };
  cacheSettings: {
    staticAssetsTTL: number;
    apiResponsesTTL: number;
    llmResponsesTTL: number;
  };
}

export interface CachedData {
  hotels: any[];
  tours: any[];
  categories: any[];
  pricing: any;
  lastUpdated: number;
}

export class KVStoreManager {
  private kv: KVNamespace;
  private defaultConfig: KVConfig;

  constructor(kvNamespace: KVNamespace) {
    this.kv = kvNamespace;
    this.defaultConfig = {
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
      cacheSettings: {
        staticAssetsTTL: 31536000, // 1 year
        apiResponsesTTL: 300, // 5 minutes
        llmResponsesTTL: 0, // No cache
      },
    };
  }

  /**
   * Get configuration with fallback to defaults
   */
  async getConfig(): Promise<KVConfig> {
    try {
      const stored = await this.kv.get('app-config', 'json');
      if (stored) {
        return { ...this.defaultConfig, ...stored };
      }
      return this.defaultConfig;
    } catch (error) {
      console.error('KV getConfig error:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<KVConfig>): Promise<boolean> {
    try {
      const current = await this.getConfig();
      const updated = { ...current, ...updates };
      await this.kv.put('app-config', JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('KV updateConfig error:', error);
      return false;
    }
  }

  /**
   * Get cached data with TTL check
   */
  async getCachedData(key: string, maxAge: number = 3600): Promise<any | null> {
    try {
      const data = await this.kv.get(key, 'json');
      if (!data) return null;

      const { value, timestamp } = data;
      const age = Date.now() - timestamp;
      
      if (age > maxAge * 1000) {
        // Data is stale, delete it
        await this.kv.delete(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error('KV getCachedData error:', error);
      return null;
    }
  }

  /**
   * Set cached data with timestamp
   */
  async setCachedData(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const data = {
        value,
        timestamp: Date.now(),
      };

      const options: any = {};
      if (ttl) {
        options.expirationTtl = ttl;
      }

      await this.kv.put(key, JSON.stringify(data), options);
      return true;
    } catch (error) {
      console.error('KV setCachedData error:', error);
      return false;
    }
  }

  /**
   * Get feature flag value
   */
  async getFeatureFlag(flag: keyof KVConfig['featureFlags']): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return config.featureFlags[flag];
    } catch (error) {
      console.error('KV getFeatureFlag error:', error);
      return this.defaultConfig.featureFlags[flag];
    }
  }

  /**
   * Set feature flag value
   */
  async setFeatureFlag(flag: keyof KVConfig['featureFlags'], value: boolean): Promise<boolean> {
    try {
      const config = await this.getConfig();
      config.featureFlags[flag] = value;
      return await this.updateConfig(config);
    } catch (error) {
      console.error('KV setFeatureFlag error:', error);
      return false;
    }
  }

  /**
   * Cache LLM conversation context
   */
  async cacheConversationContext(conversationId: string, context: any): Promise<boolean> {
    try {
      const key = `conversation-context:${conversationId}`;
      return await this.setCachedData(key, context, 3600); // 1 hour TTL
    } catch (error) {
      console.error('KV cacheConversationContext error:', error);
      return false;
    }
  }

  /**
   * Get cached conversation context
   */
  async getConversationContext(conversationId: string): Promise<any | null> {
    try {
      const key = `conversation-context:${conversationId}`;
      return await this.getCachedData(key, 3600);
    } catch (error) {
      console.error('KV getConversationContext error:', error);
      return null;
    }
  }

  /**
   * Cache booking session data
   */
  async cacheBookingSession(sessionId: string, data: any): Promise<boolean> {
    try {
      const key = `booking-session:${sessionId}`;
      return await this.setCachedData(key, data, 7200); // 2 hours TTL
    } catch (error) {
      console.error('KV cacheBookingSession error:', error);
      return false;
    }
  }

  /**
   * Get cached booking session
   */
  async getBookingSession(sessionId: string): Promise<any | null> {
    try {
      const key = `booking-session:${sessionId}`;
      return await this.getCachedData(key, 7200);
    } catch (error) {
      console.error('KV getBookingSession error:', error);
      return null;
    }
  }

  /**
   * Clean up expired data
   */
  async cleanup(): Promise<void> {
    try {
      // KV automatically handles TTL expiration, but we can implement
      // custom cleanup logic here if needed
      console.log('KV cleanup completed');
    } catch (error) {
      console.error('KV cleanup error:', error);
    }
  }
}

/**
 * Create KV store manager instance
 */
export function createKVStoreManager(env: any): KVStoreManager {
  if (!env.QATAR_STOPOVER_KV) {
    throw new Error('QATAR_STOPOVER_KV binding not found');
  }
  return new KVStoreManager(env.QATAR_STOPOVER_KV);
}