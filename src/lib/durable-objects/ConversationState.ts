/**
 * Durable Object for managing conversation state and booking sessions
 * Provides persistent state management for LLM conversations and booking flow
 */

export interface ConversationData {
  conversationId: string;
  customerId: string;
  bookingPnr: string;
  messages: Array<{
    id: string;
    sender: 'agent' | 'user';
    content: any;
    timestamp: number;
  }>;
  bookingState: {
    category?: string;
    hotel?: string;
    timing?: 'outbound' | 'return';
    duration?: number;
    extras?: {
      transfers: boolean;
      tours: Array<{ id: string; quantity: number }>;
    };
    pricing?: {
      total: number;
      breakdown: Record<string, number>;
    };
  };
  currentStep: string;
  lastActivity: number;
  metadata: {
    entryPoint: 'email' | 'mmb';
    userAgent?: string;
    ipAddress?: string;
  };
}

export class ConversationState implements DurableObject {
  private storage: DurableObjectStorage;
  private env: Env;
  private conversationData: ConversationData | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.storage = state.storage;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;

      // Handle CORS preflight
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      switch (url.pathname) {
        case '/init':
          return this.handleInit(request);
        case '/state':
          return this.handleGetState(request);
        case '/update':
          return this.handleUpdateState(request);
        case '/message':
          return this.handleAddMessage(request);
        case '/cleanup':
          return this.handleCleanup(request);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('ConversationState error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  private async handleInit(request: Request): Promise<Response> {
    const data = await request.json() as Partial<ConversationData>;
    
    const conversationId = data.conversationId || crypto.randomUUID();
    
    this.conversationData = {
      conversationId,
      customerId: data.customerId || 'alex-johnson',
      bookingPnr: data.bookingPnr || 'X4HG8',
      messages: [],
      bookingState: {},
      currentStep: 'welcome',
      lastActivity: Date.now(),
      metadata: {
        entryPoint: data.metadata?.entryPoint || 'email',
        userAgent: data.metadata?.userAgent,
        ipAddress: data.metadata?.ipAddress,
      },
    };

    await this.storage.put('conversation', this.conversationData);
    
    return new Response(JSON.stringify({
      success: true,
      conversationId,
      data: this.conversationData,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleGetState(request: Request): Promise<Response> {
    if (!this.conversationData) {
      this.conversationData = await this.storage.get('conversation') as ConversationData;
    }

    if (!this.conversationData) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: this.conversationData,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleUpdateState(request: Request): Promise<Response> {
    const updates = await request.json();
    
    if (!this.conversationData) {
      this.conversationData = await this.storage.get('conversation') as ConversationData;
    }

    if (!this.conversationData) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update conversation state
    if (updates.bookingState) {
      this.conversationData.bookingState = {
        ...this.conversationData.bookingState,
        ...updates.bookingState,
      };
    }

    if (updates.currentStep) {
      this.conversationData.currentStep = updates.currentStep;
    }

    this.conversationData.lastActivity = Date.now();

    await this.storage.put('conversation', this.conversationData);

    return new Response(JSON.stringify({
      success: true,
      data: this.conversationData,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleAddMessage(request: Request): Promise<Response> {
    const messageData = await request.json();
    
    if (!this.conversationData) {
      this.conversationData = await this.storage.get('conversation') as ConversationData;
    }

    if (!this.conversationData) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const message = {
      id: crypto.randomUUID(),
      sender: messageData.sender,
      content: messageData.content,
      timestamp: Date.now(),
    };

    this.conversationData.messages.push(message);
    this.conversationData.lastActivity = Date.now();

    // Keep only last 50 messages to manage storage
    if (this.conversationData.messages.length > 50) {
      this.conversationData.messages = this.conversationData.messages.slice(-50);
    }

    await this.storage.put('conversation', this.conversationData);

    return new Response(JSON.stringify({
      success: true,
      message,
      totalMessages: this.conversationData.messages.length,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleCleanup(request: Request): Promise<Response> {
    // Clean up old conversations (older than 24 hours)
    if (this.conversationData && 
        Date.now() - this.conversationData.lastActivity > 24 * 60 * 60 * 1000) {
      await this.storage.deleteAll();
      this.conversationData = null;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Export for Cloudflare Workers
export default ConversationState;