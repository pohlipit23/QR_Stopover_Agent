// Mock the AI SDK first
jest.mock('ai', () => ({
  streamText: jest.fn()
}));

// Mock the OpenAI SDK to avoid TransformStream issues
jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(() => jest.fn())
}));

// Mock the LLM config to avoid import issues
jest.mock('../lib/llm-config', () => ({
  llmConfig: {
    model: 'mocked-model',
    fallbackModels: ['fallback1', 'fallback2'],
    maxTokens: 4096,
    temperature: 0.7,
    streamingEnabled: true
  },
  validateLLMConfig: jest.fn(() => true),
  getModelWithFallback: jest.fn((attempt) => `fallback-${attempt}`)
}));

import { POST } from '../pages/api/chat';
import { bookingFunctions } from '../lib/booking-functions';
import { llmConfig, validateLLMConfig, getModelWithFallback } from '../lib/llm-config';

// Mock environment variables
const originalEnv = process.env;

describe('LLM Integration Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: 'test-key-placeholder-not-real',
      DEFAULT_MODEL: 'google/gemini-2.0-flash-exp',
      FALLBACK_MODELS: 'anthropic/claude-3-haiku,openai/gpt-4o-mini',
      MAX_TOKENS: '4096',
      TEMPERATURE: '0.7',
      STREAMING_ENABLED: 'true'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('API Endpoint Tests', () => {
    it('should handle valid chat requests', async () => {
      const { streamText } = require('ai');
      const mockStreamResponse = {
        toTextStreamResponse: jest.fn().mockReturnValue(new Response('Mock response'))
      };
      streamText.mockResolvedValue(mockStreamResponse);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: [
            { role: 'user', content: 'Hello, I want to add a stopover' }
          ],
          conversationContext: {
            customer: { name: 'Alex Johnson', privilegeClubNumber: 'QR12345678' },
            booking: { pnr: 'X4HG8', route: { origin: 'LHR', destination: 'BKK' } }
          }
        })
      };

      const response = await POST({ request: mockRequest } as any);

      expect(streamText).toHaveBeenCalledWith({
        model: expect.any(Object),
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Hello, I want to add a stopover' })
        ]),
        tools: bookingFunctions,
        system: expect.stringContaining('Qatar Airways stopover booking assistant'),
        temperature: 0.7
      });

      expect(mockStreamResponse.toTextStreamResponse).toHaveBeenCalled();
    });

    it('should handle invalid request format', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: 'invalid format'
        })
      };

      const response = await POST({ request: mockRequest } as any);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid messages format');
    });

    it('should handle missing API key', async () => {
      process.env.OPENROUTER_API_KEY = '';

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      };

      const response = await POST({ request: mockRequest } as any);

      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData.error).toBe('LLM configuration invalid. Please check environment variables.');
    });

    it('should handle rate limit errors with proper fallback', async () => {
      const { streamText } = require('ai');
      
      // First call fails with rate limit
      streamText
        .mockRejectedValueOnce(new Error('rate limit exceeded'))
        .mockResolvedValueOnce({
          toTextStreamResponse: jest.fn().mockReturnValue(new Response('Fallback response'))
        });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext: {}
        })
      };

      const response = await POST({ request: mockRequest } as any);

      // Should have tried twice (original + 1 fallback)
      expect(streamText).toHaveBeenCalledTimes(2);
      expect(response.status).toBe(200);
    });

    it('should handle context length errors', async () => {
      const { streamText } = require('ai');
      streamText.mockRejectedValue(new Error('context length exceeded'));

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext: {}
        })
      };

      const response = await POST({ request: mockRequest } as any);

      expect(response.status).toBe(413);
      const responseData = await response.json();
      expect(responseData.error).toBe('Conversation too long. Please start a new conversation.');
    });

    it('should generate proper system prompt with context', async () => {
      const { streamText } = require('ai');
      streamText.mockResolvedValue({
        toTextStreamResponse: jest.fn().mockReturnValue(new Response('Mock response'))
      });

      const conversationContext = {
        customer: { name: 'Alex Johnson', privilegeClubNumber: 'QR12345678' },
        booking: { pnr: 'X4HG8', route: { origin: 'LHR', destination: 'BKK' }, passengers: 2 },
        currentStep: 'category-selection'
      };

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext
        })
      };

      await POST({ request: mockRequest } as any);

      const systemPrompt = streamText.mock.calls[0][0].system;
      expect(systemPrompt).toContain('Alex Johnson');
      expect(systemPrompt).toContain('X4HG8');
      expect(systemPrompt).toContain('LHR → BKK');
      expect(systemPrompt).toContain('2');
      expect(systemPrompt).toContain('category-selection');
      expect(systemPrompt).toContain('showStopoverCategories');
      expect(systemPrompt).toContain('selectStopoverCategory');
    });
  });

  describe('LLM Configuration Tests', () => {
    it('should validate LLM configuration correctly', () => {
      expect(validateLLMConfig()).toBe(true);

      process.env.OPENROUTER_API_KEY = '';
      expect(validateLLMConfig()).toBe(false);
    });

    it('should provide correct model fallback chain', () => {
      const model0 = getModelWithFallback(0);
      const model1 = getModelWithFallback(1);
      const model2 = getModelWithFallback(2);
      const model3 = getModelWithFallback(3); // Should return last available model

      expect(model0).toBe(llmConfig.model);
      expect(model1).toBe(llmConfig.fallbackModels[0]);
      expect(model2).toBe(llmConfig.fallbackModels[1]);
      expect(model3).toBe(llmConfig.fallbackModels[1]); // Should not exceed array bounds
    });

    it('should parse environment variables correctly', () => {
      expect(llmConfig.maxTokens).toBe(4096);
      expect(llmConfig.temperature).toBe(0.7);
      expect(llmConfig.streamingEnabled).toBe(true);
    });
  });

  describe('Booking Functions Tests', () => {
    it('should execute showStopoverCategories function', async () => {
      const result = await bookingFunctions.showStopoverCategories.execute({});

      expect(result.success).toBe(true);
      expect(result.categories).toBeDefined();
      expect(result.uiComponent.type).toBe('stopover-categories');
      expect(result.message).toContain('stopover categories');
    });

    it('should execute selectStopoverCategory function', async () => {
      const params = { categoryId: 'premium', categoryName: 'Premium' };
      const result = await bookingFunctions.selectStopoverCategory.execute(params);

      expect(result.success).toBe(true);
      expect(result.selectedCategory).toBe('premium');
      expect(result.hotels).toBeDefined();
      expect(result.uiComponent.type).toBe('hotels');
      expect(result.message).toContain('Premium');
    });

    it('should execute selectHotel function', async () => {
      const params = { hotelId: 'millennium', hotelName: 'Millennium Hotel Doha' };
      const result = await bookingFunctions.selectHotel.execute(params);

      expect(result.success).toBe(true);
      expect(result.selectedHotel).toBe('millennium');
      expect(result.uiComponent.type).toBe('stopover-options');
      expect(result.message).toContain('Millennium Hotel Doha');
    });

    it('should execute selectTimingAndDuration function', async () => {
      const params = { timing: 'outbound', duration: 2 };
      const result = await bookingFunctions.selectTimingAndDuration.execute(params);

      expect(result.success).toBe(true);
      expect(result.selectedTiming).toBe('outbound');
      expect(result.selectedDuration).toBe(2);
      expect(result.uiComponent.type).toBe('stopover-extras');
      expect(result.message).toContain('2-night outbound');
    });

    it('should execute selectExtras function with pricing calculation', async () => {
      const params = {
        includeTransfers: true,
        selectedTours: [
          { tourId: 'whale-sharks', tourName: 'Whale Sharks of Qatar', quantity: 2, totalPrice: 390 }
        ],
        totalExtrasPrice: 450
      };
      const result = await bookingFunctions.selectExtras.execute(params);

      expect(result.success).toBe(true);
      expect(result.selectedExtras.transfers).toBe(true);
      expect(result.selectedExtras.tours).toHaveLength(1);
      expect(result.pricing.totalCashPrice).toBeGreaterThan(0);
      expect(result.pricing.totalAviosPrice).toBe(result.pricing.totalCashPrice * 125);
      expect(result.uiComponent.type).toBe('summary');
    });

    it('should execute initiatePayment function for credit card', async () => {
      const params = { paymentMethod: 'credit-card', totalAmount: 500 };
      const result = await bookingFunctions.initiatePayment.execute(params);

      expect(result.success).toBe(true);
      expect(result.paymentInitialized).toBe(true);
      expect(result.uiComponent.type).toBe('form');
      expect(result.uiComponent.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'cardNumber', type: 'text' }),
          expect.objectContaining({ id: 'expiryDate', type: 'text' }),
          expect.objectContaining({ id: 'cvv', type: 'text' }),
          expect.objectContaining({ id: 'nameOnCard', type: 'text' })
        ])
      );
    });

    it('should execute initiatePayment function for Avios', async () => {
      const params = { paymentMethod: 'avios', totalAmount: 500 };
      const result = await bookingFunctions.initiatePayment.execute(params);

      expect(result.success).toBe(true);
      expect(result.uiComponent.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'privilegeClubId', type: 'text' }),
          expect.objectContaining({ id: 'password', type: 'password' })
        ])
      );
      expect(result.message).toContain('Privilege Club');
    });

    it('should execute completeBooking function', async () => {
      const params = { paymentData: { method: 'credit-card', confirmed: true } };
      const result = await bookingFunctions.completeBooking.execute(params);

      expect(result.success).toBe(true);
      expect(result.bookingComplete).toBe(true);
      expect(result.newPNR).toBe('X9FG1');
      expect(result.uiComponent.type).toBe('summary');
      expect(result.message).toContain('X9FG1');
      expect(result.message).toContain('🎉');
    });
  });

  describe('Function Parameter Validation', () => {
    it('should validate selectStopoverCategory parameters', () => {
      const schema = bookingFunctions.selectStopoverCategory.inputSchema;
      
      // Valid parameters
      const validParams = { categoryId: 'premium', categoryName: 'Premium' };
      const validResult = schema.safeParse(validParams);
      expect(validResult.success).toBe(true);

      // Invalid parameters
      const invalidParams = { categoryId: 123 }; // Missing categoryName, wrong type
      const invalidResult = schema.safeParse(invalidParams);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate selectTimingAndDuration parameters', () => {
      const schema = bookingFunctions.selectTimingAndDuration.inputSchema;
      
      // Valid parameters
      const validParams = { timing: 'outbound', duration: 2 };
      const validResult = schema.safeParse(validParams);
      expect(validResult.success).toBe(true);

      // Invalid timing
      const invalidTiming = { timing: 'invalid', duration: 2 };
      const invalidTimingResult = schema.safeParse(invalidTiming);
      expect(invalidTimingResult.success).toBe(false);

      // Invalid duration (out of range)
      const invalidDuration = { timing: 'outbound', duration: 5 };
      const invalidDurationResult = schema.safeParse(invalidDuration);
      expect(invalidDurationResult.success).toBe(false);
    });

    it('should validate selectExtras parameters', () => {
      const schema = bookingFunctions.selectExtras.inputSchema;
      
      // Valid parameters
      const validParams = {
        includeTransfers: true,
        selectedTours: [
          { tourId: 'whale-sharks', tourName: 'Whale Sharks', quantity: 2, totalPrice: 390 }
        ],
        totalExtrasPrice: 450
      };
      const validResult = schema.safeParse(validParams);
      expect(validResult.success).toBe(true);

      // Invalid tour structure
      const invalidTours = {
        includeTransfers: false,
        selectedTours: [
          { tourId: 'whale-sharks' } // Missing required fields
        ],
        totalExtrasPrice: 0
      };
      const invalidResult = schema.safeParse(invalidTours);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('Error Handling in Functions', () => {
    it('should handle function execution errors gracefully', async () => {
      // Mock a function that might throw an error
      const originalExecute = bookingFunctions.selectStopoverCategory.execute;
      bookingFunctions.selectStopoverCategory.execute = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );

      try {
        await bookingFunctions.selectStopoverCategory.execute({ 
          categoryId: 'premium', 
          categoryName: 'Premium' 
        });
      } catch (error) {
        expect(error.message).toBe('Database connection failed');
      }

      // Restore original function
      bookingFunctions.selectStopoverCategory.execute = originalExecute;
    });

    it('should validate function return values', async () => {
      const result = await bookingFunctions.showStopoverCategories.execute({});

      // Verify required properties
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('uiComponent');
      expect(result).toHaveProperty('message');
      
      // Verify uiComponent structure
      expect(result.uiComponent).toHaveProperty('type');
      expect(result.uiComponent).toHaveProperty('data');
      
      // Verify data types
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(typeof result.uiComponent.type).toBe('string');
    });
  });

  describe('Conversation Context Management', () => {
    it('should handle conversation context in system prompt generation', async () => {
      const { streamText } = require('ai');
      streamText.mockResolvedValue({
        toTextStreamResponse: jest.fn().mockReturnValue(new Response('Mock response'))
      });

      const contexts = [
        {
          customer: { name: 'John Doe', privilegeClubNumber: 'QR87654321' },
          booking: { pnr: 'ABC123', route: { origin: 'DOH', destination: 'JFK' }, passengers: 1 },
          currentStep: 'welcome'
        },
        {
          customer: { name: 'Jane Smith', privilegeClubNumber: 'QR11111111' },
          booking: { pnr: 'XYZ789', route: { origin: 'LGW', destination: 'SYD' }, passengers: 4 },
          currentStep: 'hotel-selection'
        }
      ];

      for (const context of contexts) {
        const mockRequest = {
          json: jest.fn().mockResolvedValue({
            messages: [{ role: 'user', content: 'Hello' }],
            conversationContext: context
          })
        };

        await POST({ request: mockRequest } as any);

        const systemPrompt = streamText.mock.calls[streamText.mock.calls.length - 1][0].system;
        expect(systemPrompt).toContain(context.customer.name);
        expect(systemPrompt).toContain(context.booking.pnr);
        expect(systemPrompt).toContain(context.booking.route.origin);
        expect(systemPrompt).toContain(context.booking.route.destination);
        expect(systemPrompt).toContain(context.booking.passengers.toString());
        expect(systemPrompt).toContain(context.currentStep);
      }
    });

    it('should handle missing context gracefully', async () => {
      const { streamText } = require('ai');
      streamText.mockResolvedValue({
        toTextStreamResponse: jest.fn().mockReturnValue(new Response('Mock response'))
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext: {} // Empty context
        })
      };

      const response = await POST({ request: mockRequest } as any);

      expect(response.status).toBe(200);
      
      const systemPrompt = streamText.mock.calls[streamText.mock.calls.length - 1][0].system;
      expect(systemPrompt).toContain('Valued Customer');
      expect(systemPrompt).toContain('N/A');
      expect(systemPrompt).toContain('LHR');
      expect(systemPrompt).toContain('BKK');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent requests', async () => {
      const { streamText } = require('ai');
      streamText.mockResolvedValue({
        toTextStreamResponse: jest.fn().mockReturnValue(new Response('Mock response'))
      });

      const createRequest = (id: number) => ({
        json: jest.fn().mockResolvedValue({
          messages: [{ role: 'user', content: `Hello ${id}` }],
          conversationContext: {
            customer: { name: `User ${id}` },
            booking: { pnr: `PNR${id}` }
          }
        })
      });

      // Simulate 5 concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) => 
        POST({ request: createRequest(i) } as any)
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should have made 5 streamText calls
      expect(streamText).toHaveBeenCalledTimes(5);
    });

    it('should handle timeout scenarios', async () => {
      const { streamText } = require('ai');
      
      // Simulate timeout
      streamText.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext: {}
        })
      };

      const response = await POST({ request: mockRequest } as any);

      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData.error).toBe('An unexpected error occurred');
      expect(responseData.retryable).toBe(true);
    });
  });
});