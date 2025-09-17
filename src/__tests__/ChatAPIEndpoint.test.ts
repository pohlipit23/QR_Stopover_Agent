import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Polyfill for Request and Response in Node.js environment
global.Request = class MockRequest {
  method: string;
  url: string;
  headers: Map<string, string>;
  body: string;

  constructor(url: string, init?: any) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Map();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value as string);
      });
    }
    this.body = init?.body || '';
  }

  async json() {
    return JSON.parse(this.body);
  }
} as any;

global.Response = class MockResponse {
  status: number;
  headers: Map<string, string>;
  body: string;

  constructor(body?: string, init?: any) {
    this.body = body || '';
    this.status = init?.status || 200;
    this.headers = new Map();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value as string);
      });
    }
  }

  async json() {
    return JSON.parse(this.body);
  }

  get(name: string) {
    return this.headers.get(name);
  }

  set(name: string, value: string) {
    this.headers.set(name, value);
  }
} as any;

// Mock all dependencies before importing the API
jest.mock('ai', () => ({
  streamText: jest.fn()
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

jest.mock('../lib/llm-config-server', () => ({
  createLLMConfig: jest.fn(() => ({ temperature: 0.7 })),
  getModelWithFallback: jest.fn(() => ({ modelId: 'test-model' })),
  validateServerLLMConfig: jest.fn(() => true)
}));

jest.mock('../utils/security', () => ({
  securityMiddleware: jest.fn(() => ({
    allowed: true,
    headers: {},
    errors: []
  }))
}));

jest.mock('../utils/caching', () => ({
  cacheMiddleware: jest.fn(() => ({}))
}));

jest.mock('../utils/monitoring', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  },
  analytics: {
    track: jest.fn(),
    trackLLM: jest.fn()
  },
  errorReporter: {
    report: jest.fn()
  }
}));

jest.mock('../utils/performance', () => ({
  measurePerformance: {
    llm: jest.fn(async (fn) => await fn())
  }
}));

jest.mock('../lib/cloudflare/data-access', () => ({
  createDataAccessManager: jest.fn(() => null)
}));

jest.mock('../lib/cloudflare/error-handling', () => ({
  createErrorHandler: jest.fn(() => ({
    handleDurableObjectError: jest.fn()
  }))
}));

// Now import the modules after mocking
import { POST } from '../pages/api/chat';
import { bookingFunctions } from '../lib/booking-functions';

describe('Chat API Endpoint Integration Tests', () => {
  let mockStreamText: any;
  let mockRequest: Request;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup streamText mock
    const { streamText } = require('ai');
    mockStreamText = streamText as any;
    
    // Create a mock request
    mockRequest = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'I want to book a stopover' }
        ],
        conversationContext: {
          customer: { name: 'Test User' },
          booking: { pnr: 'ABC123' }
        }
      })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Tool Integration with AI SDK', () => {
    it('should process tool calls without errors', async () => {
      // Mock successful streamText response
      const mockResponse = {
        toTextStreamResponse: () => new Response('Test response', {
          headers: { 'Content-Type': 'text/plain' }
        })
      };
      mockStreamText.mockResolvedValue(mockResponse);

      const response = await POST({ request: mockRequest });

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(mockStreamText).toHaveBeenCalledWith({
        model: expect.any(Object),
        messages: expect.any(Array),
        tools: bookingFunctions,
        system: expect.any(String),
        temperature: 0.7
      });
    });

    it('should pass all booking functions as tools to AI SDK', async () => {
      const mockResponse = {
        toTextStreamResponse: () => new Response('Test response')
      };
      mockStreamText.mockResolvedValue(mockResponse);

      await POST({ request: mockRequest });

      const streamTextCall = mockStreamText.mock.calls[0][0];
      expect(streamTextCall.tools).toBe(bookingFunctions);
      
      // Verify all expected tools are present
      const expectedTools = [
        'showStopoverCategories',
        'selectStopoverCategory', 
        'selectHotel',
        'selectTimingAndDuration',
        'selectExtras',
        'initiatePayment',
        'completeBooking'
      ];
      
      expectedTools.forEach(toolName => {
        expect(streamTextCall.tools).toHaveProperty(toolName);
      });
    });

    it('should handle tool validation errors gracefully', async () => {
      // Mock streamText to throw a validation error
      const validationError = new Error('Tool validation failed: Cannot read properties of undefined (reading \'_def\')');
      mockStreamText.mockRejectedValue(validationError);

      const response = await POST({ request: mockRequest });

      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
      expect(responseData.retryable).toBe(true);
    });
  });

  describe('API Error Handling', () => {
    it('should handle invalid request format', async () => {
      const invalidRequest = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'format' })
      });

      const response = await POST({ request: invalidRequest });
      expect(response.status).toBe(400);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid messages format');
    });

    it('should handle LLM configuration errors', async () => {
      const { validateServerLLMConfig } = require('../lib/llm-config-server');
      validateServerLLMConfig.mockReturnValue(false);

      const response = await POST({ request: mockRequest });
      expect(response.status).toBe(500);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('LLM configuration invalid. Please check environment variables.');
    });

    it('should handle rate limit errors', async () => {
      // Ensure LLM config validation passes
      const { validateServerLLMConfig } = require('../lib/llm-config-server');
      validateServerLLMConfig.mockReturnValue(true);
      
      const rateLimitError = new Error('API rate limit exceeded');
      mockStreamText.mockRejectedValue(rateLimitError);

      const response = await POST({ request: mockRequest });
      expect(response.status).toBe(429);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Rate limit exceeded. Please try again in a moment.');
      expect(responseData.retryable).toBe(true);
    });

    it('should handle context length errors', async () => {
      // Ensure LLM config validation passes
      const { validateServerLLMConfig } = require('../lib/llm-config-server');
      validateServerLLMConfig.mockReturnValue(true);
      
      const contextError = new Error('Maximum context length exceeded');
      mockStreamText.mockRejectedValue(contextError);

      const response = await POST({ request: mockRequest });
      expect(response.status).toBe(413);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Conversation too long. Please start a new conversation.');
    });

    it('should handle authentication errors', async () => {
      // Ensure LLM config validation passes
      const { validateServerLLMConfig } = require('../lib/llm-config-server');
      validateServerLLMConfig.mockReturnValue(true);
      
      const authError = new Error('API authentication failed');
      mockStreamText.mockRejectedValue(authError);

      const response = await POST({ request: mockRequest });
      expect(response.status).toBe(401);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Authentication failed. Please check API configuration.');
    });
  });

  describe('Security Integration', () => {
    it('should block requests when security middleware denies access', async () => {
      const { securityMiddleware } = require('../utils/security');
      securityMiddleware.mockReturnValue({
        allowed: false,
        errors: ['Rate limit exceeded'],
        headers: { 'X-RateLimit-Remaining': '0' }
      });

      const response = await POST({ request: mockRequest });
      expect(response.status).toBe(429);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Request blocked');
      expect(responseData.details).toEqual(['Rate limit exceeded']);
    });

    it('should include security headers in successful responses', async () => {
      const mockResponse = {
        toTextStreamResponse: () => {
          const response = new Response('Test response');
          return response;
        }
      };
      mockStreamText.mockResolvedValue(mockResponse);

      const { securityMiddleware } = require('../utils/security');
      securityMiddleware.mockReturnValue({
        allowed: true,
        headers: { 'X-Content-Type-Options': 'nosniff' },
        errors: []
      });

      const response = await POST({ request: mockRequest });
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('Tool Parameter Edge Cases', () => {
    it('should handle edge case parameters correctly', async () => {
      // Test minimum and maximum duration values
      expect(() => {
        bookingFunctions.selectTimingAndDuration.parameters.parse({
          timing: 'outbound',
          duration: 1 // minimum
        });
      }).not.toThrow();

      expect(() => {
        bookingFunctions.selectTimingAndDuration.parameters.parse({
          timing: 'return',
          duration: 4 // maximum
        });
      }).not.toThrow();

      // Test empty tours array
      expect(() => {
        bookingFunctions.selectExtras.parameters.parse({
          includeTransfers: false,
          selectedTours: [],
          totalExtrasPrice: 0
        });
      }).not.toThrow();

      // Test both payment methods
      expect(() => {
        bookingFunctions.initiatePayment.parameters.parse({
          paymentMethod: 'credit-card',
          totalAmount: 500
        });
      }).not.toThrow();

      expect(() => {
        bookingFunctions.initiatePayment.parameters.parse({
          paymentMethod: 'avios',
          totalAmount: 62500
        });
      }).not.toThrow();
    });
  });
});