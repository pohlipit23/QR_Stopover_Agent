/**
 * Data access patterns for booking session coordination
 * Provides unified interface for accessing Cloudflare data services
 */

import { KVStoreManager } from './kv-store';
import { R2StorageManager } from './r2-storage';

export interface BookingSession {
  sessionId: string;
  conversationId: string;
  customerId: string;
  bookingPnr: string;
  state: {
    currentStep: string;
    selections: {
      category?: string;
      hotel?: string;
      timing?: 'outbound' | 'return';
      duration?: number;
      extras?: {
        transfers: boolean;
        tours: Array<{ id: string; quantity: number }>;
      };
    };
    pricing?: {
      total: number;
      breakdown: Record<string, number>;
    };
  };
  metadata: {
    entryPoint: 'email' | 'mmb';
    startedAt: number;
    lastActivity: number;
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface ConversationSession {
  conversationId: string;
  durableObjectId: string;
  messages: Array<{
    id: string;
    sender: 'agent' | 'user';
    content: any;
    timestamp: number;
  }>;
  context: {
    customerId: string;
    bookingPnr: string;
    currentStep: string;
    llmModel: string;
    functionCallsEnabled: boolean;
  };
}

export class DataAccessManager {
  private kvStore: KVStoreManager;
  private r2Storage: R2StorageManager;
  private env: any;

  constructor(env: any) {
    this.env = env;
    this.kvStore = new KVStoreManager(env.QATAR_STOPOVER_KV);
    this.r2Storage = new R2StorageManager(env.QATAR_STOPOVER_ASSETS);
  }

  /**
   * Initialize a new booking session
   */
  async initializeBookingSession(
    customerId: string,
    bookingPnr: string,
    entryPoint: 'email' | 'mmb',
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<BookingSession> {
    const sessionId = crypto.randomUUID();
    const conversationId = crypto.randomUUID();

    const session: BookingSession = {
      sessionId,
      conversationId,
      customerId,
      bookingPnr,
      state: {
        currentStep: 'welcome',
        selections: {},
      },
      metadata: {
        entryPoint,
        startedAt: Date.now(),
        lastActivity: Date.now(),
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
      },
    };

    // Cache the session in KV store
    await this.kvStore.cacheBookingSession(sessionId, session);

    return session;
  }

  /**
   * Get booking session by ID
   */
  async getBookingSession(sessionId: string): Promise<BookingSession | null> {
    return await this.kvStore.getBookingSession(sessionId);
  }

  /**
   * Update booking session state
   */
  async updateBookingSession(
    sessionId: string,
    updates: Partial<BookingSession['state']>
  ): Promise<boolean> {
    const session = await this.getBookingSession(sessionId);
    if (!session) return false;

    session.state = { ...session.state, ...updates };
    session.metadata.lastActivity = Date.now();

    return await this.kvStore.cacheBookingSession(sessionId, session);
  }

  /**
   * Initialize conversation with Durable Object
   */
  async initializeConversation(
    conversationId: string,
    customerId: string,
    bookingPnr: string,
    entryPoint: 'email' | 'mmb'
  ): Promise<string> {
    // Get Durable Object ID
    const durableObjectId = this.env.CONVERSATION_STATE.idFromName(conversationId);
    const durableObject = this.env.CONVERSATION_STATE.get(durableObjectId);

    // Initialize conversation state
    const response = await durableObject.fetch('https://conversation/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        customerId,
        bookingPnr,
        metadata: { entryPoint },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize conversation');
    }

    return conversationId;
  }

  /**
   * Get conversation state from Durable Object
   */
  async getConversationState(conversationId: string): Promise<any> {
    const durableObjectId = this.env.CONVERSATION_STATE.idFromName(conversationId);
    const durableObject = this.env.CONVERSATION_STATE.get(durableObjectId);

    const response = await durableObject.fetch('https://conversation/state', {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update conversation state
   */
  async updateConversationState(
    conversationId: string,
    updates: any
  ): Promise<boolean> {
    const durableObjectId = this.env.CONVERSATION_STATE.idFromName(conversationId);
    const durableObject = this.env.CONVERSATION_STATE.get(durableObjectId);

    const response = await durableObject.fetch('https://conversation/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    return response.ok;
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    sender: 'agent' | 'user',
    content: any
  ): Promise<boolean> {
    const durableObjectId = this.env.CONVERSATION_STATE.idFromName(conversationId);
    const durableObject = this.env.CONVERSATION_STATE.get(durableObjectId);

    const response = await durableObject.fetch('https://conversation/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, content }),
    });

    return response.ok;
  }

  /**
   * Get asset URL from R2 storage
   */
  getAssetUrl(category: string, filename: string): string {
    const key = `${category}/${filename}`;
    return this.r2Storage.getPublicUrl(key);
  }

  /**
   * Get all hotel images
   */
  getHotelImages(): Record<string, string> {
    return {
      millennium: this.getAssetUrl('hotels', 'millenium_hotel.webp'),
      steigenberger: this.getAssetUrl('hotels', 'steigenberger_hotel.webp'),
      souqWaqif: this.getAssetUrl('hotels', 'souq_waqif_hotel.webp'),
      crownePlaza: this.getAssetUrl('hotels', 'crowne_plaza_hotel.webp'),
      alNajada: this.getAssetUrl('hotels', 'al_najada_hotel.webp'),
      raffles: this.getAssetUrl('hotels', 'raffles_hotel_doha.jpg'),
    };
  }

  /**
   * Get all category images
   */
  getCategoryImages(): Record<string, string> {
    return {
      standard: this.getAssetUrl('categories', 'standard_stopover.jpg'),
      premium: this.getAssetUrl('categories', 'premium_stopover.jpg'),
      premiumBeach: this.getAssetUrl('categories', 'premium_beach_stopover.jpg'),
      luxury: this.getAssetUrl('categories', 'luxury_stopover.jpg'),
    };
  }

  /**
   * Get all tour images
   */
  getTourImages(): Record<string, string> {
    return {
      whaleSharks: this.getAssetUrl('tours', 'whale sharks of qatar.jpg'),
      shaleShark: this.getAssetUrl('tours', 'shale_shark.webp'),
      thePearl: this.getAssetUrl('tours', 'the pearl.jpg'),
      airportTransfer: this.getAssetUrl('tours', 'airport_transfer.webp'),
    };
  }

  /**
   * Get brand logos
   */
  getBrandLogos(): Record<string, string> {
    return {
      qatarAirways: this.getAssetUrl('logos', 'qatar-airways-logo.png'),
      privilegeClub: this.getAssetUrl('logos', 'privilege-club-logo.png'),
    };
  }

  /**
   * Coordinate booking session with conversation state
   */
  async coordinateBookingSession(
    sessionId: string,
    conversationId: string,
    updates: any
  ): Promise<boolean> {
    try {
      // Update both booking session and conversation state
      const [sessionUpdated, conversationUpdated] = await Promise.all([
        this.updateBookingSession(sessionId, updates),
        this.updateConversationState(conversationId, updates),
      ]);

      return sessionUpdated && conversationUpdated;
    } catch (error) {
      console.error('Booking session coordination error:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Clean up KV store
      await this.kvStore.cleanup();

      // Clean up Durable Objects (they handle their own cleanup)
      console.log('Session cleanup completed');
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  /**
   * Get configuration from KV store
   */
  async getConfiguration(): Promise<any> {
    return await this.kvStore.getConfig();
  }

  /**
   * Get feature flag value
   */
  async getFeatureFlag(flag: string): Promise<boolean> {
    return await this.kvStore.getFeatureFlag(flag as any);
  }

  /**
   * Health check for all data services
   */
  async healthCheck(): Promise<{
    kv: boolean;
    r2: boolean;
    durableObjects: boolean;
  }> {
    const results = {
      kv: false,
      r2: false,
      durableObjects: false,
    };

    try {
      // Test KV store
      await this.kvStore.getConfig();
      results.kv = true;
    } catch (error) {
      console.error('KV health check failed:', error);
    }

    try {
      // Test R2 storage
      await this.r2Storage.listFiles('', 1);
      results.r2 = true;
    } catch (error) {
      console.error('R2 health check failed:', error);
    }

    try {
      // Test Durable Objects
      const testId = 'health-check';
      const durableObjectId = this.env.CONVERSATION_STATE.idFromName(testId);
      const durableObject = this.env.CONVERSATION_STATE.get(durableObjectId);
      const response = await durableObject.fetch('https://conversation/state');
      results.durableObjects = true;
    } catch (error) {
      console.error('Durable Objects health check failed:', error);
    }

    return results;
  }
}

/**
 * Create data access manager instance
 */
export function createDataAccessManager(env: any): DataAccessManager {
  return new DataAccessManager(env);
}