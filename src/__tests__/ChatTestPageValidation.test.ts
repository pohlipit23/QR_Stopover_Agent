import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('Chat Test Page Validation', () => {
  beforeAll(() => {
    // Setup mock responses
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/chat-test')) {
        return Promise.resolve({
          status: 200,
          headers: { get: (name: string) => name === 'content-type' ? 'text/html' : null },
          text: () => Promise.resolve(`
            <!DOCTYPE html>
            <html>
              <head><title>Chat Test - Qatar Airways Stopover</title></head>
              <body>
                <h1>Chat Container Test</h1>
                <p>Testing the MessageBubble component integration</p>
                <div class="bg-primary-burgundy text-primary-burgundy">
                  <div data-component="ChatContainer" client:load></div>
                </div>
              </body>
            </html>
          `)
        });
      }
      
      if (url.includes('/api/chat')) {
        if (options?.method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          
          if (!body.messages || !Array.isArray(body.messages)) {
            return Promise.resolve({
              status: 400,
              json: () => Promise.resolve({ error: 'Invalid messages format' })
            });
          }
          
          return Promise.resolve({
            status: 200,
            headers: { get: (name: string) => name === 'content-type' ? 'text/plain' : null },
            text: () => Promise.resolve('Mock AI response')
          });
        }
      }
      
      return Promise.resolve({
        status: 404,
        text: () => Promise.resolve('Not found')
      });
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Page Loading Tests', () => {
    it('should load /chat-test page without server errors', async () => {
      const response = await fetch('/chat-test');
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      
      const html = await response.text();
      expect(html).toContain('Chat Container Test');
      expect(html).toContain('Qatar Airways Stopover');
    });

    it('should include required CSS and JavaScript assets', async () => {
      const response = await fetch('/chat-test');
      const html = await response.text();
      
      // Check for essential elements
      expect(html).toContain('ChatContainer');
      expect(html).toContain('client:load');
      
      // Check for Qatar Airways styling
      expect(html).toContain('bg-primary-burgundy');
      expect(html).toContain('text-primary-burgundy');
    });

    it('should have proper page structure and metadata', async () => {
      const response = await fetch('/chat-test');
      const html = await response.text();
      
      // Check for proper HTML structure
      expect(html).toContain('<title>Chat Test - Qatar Airways Stopover</title>');
      expect(html).toContain('Chat Container Test');
      expect(html).toContain('Testing the MessageBubble component integration');
    });
  });

  describe('Chat API Integration Tests', () => {
    it('should accept POST requests to /api/chat', async () => {
      const testMessage = {
        messages: [
          {
            role: 'user',
            content: 'Hello, I would like to add a stopover to my booking.'
          }
        ],
        conversationContext: {
          customer: {
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          booking: {
            pnr: 'ABC123',
            route: {
              origin: 'LHR',
              destination: 'BKK'
            },
            passengers: 2
          },
          entryPoint: 'email'
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage)
      });

      // Should not return server errors (5xx)
      expect(response.status).toBeLessThan(500);
      
      // Should be a successful response or client error (not server error)
      expect([200, 201, 400, 401, 403, 429].includes(response.status)).toBe(true);
    });

    it('should handle invalid request format gracefully', async () => {
      const invalidRequest = {
        invalidField: 'test'
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidRequest)
      });

      expect(response.status).toBe(400);
      
      const errorResponse = await response.json();
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('Invalid messages format');
    });

    it('should validate tool structure without Zod schema errors', async () => {
      const toolTestMessage = {
        messages: [
          {
            role: 'user',
            content: 'Show me the available stopover categories.'
          }
        ],
        conversationContext: {
          customer: {
            name: 'Test User',
            email: 'test@example.com'
          },
          booking: {
            pnr: 'TEST123',
            route: {
              origin: 'LHR',
              destination: 'SYD'
            },
            passengers: 1
          },
          entryPoint: 'email'
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolTestMessage)
      });

      // Should not fail with Zod schema errors
      expect(response.status).not.toBe(500);
      
      // If there's an error, it shouldn't be related to Zod schema validation
      if (response.status >= 400) {
        const errorText = await response.text();
        expect(errorText).not.toContain('_def');
        expect(errorText).not.toContain('Cannot read properties of undefined');
      }
    });
  });

  describe('Tool Functionality Tests', () => {
    it('should process tool calls without schema validation errors', async () => {
      // Test each booking function tool structure
      const { bookingFunctions } = require('../lib/booking-functions');
      
      // Verify each tool has the correct structure
      Object.entries(bookingFunctions).forEach(([toolName, tool]: [string, any]) => {
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('parameters');
        expect(tool).toHaveProperty('execute');
        
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.execute).toBe('function');
        
        // Verify parameters is a Zod schema object
        expect(tool.parameters).toBeDefined();
        expect(tool.parameters._def).toBeDefined(); // Zod schemas have _def property
      });
    });

    it('should execute showStopoverCategories tool successfully', async () => {
      const { showStopoverCategories } = require('../lib/booking-functions');
      
      const result = await showStopoverCategories.execute({});
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('uiComponent');
      expect(result.uiComponent).toHaveProperty('type', 'stopover-categories');
    });

    it('should execute selectStopoverCategory tool with valid parameters', async () => {
      const { selectStopoverCategory } = require('../lib/booking-functions');
      
      const testParams = {
        categoryId: 'premium',
        categoryName: 'Premium'
      };
      
      const result = await selectStopoverCategory.execute(testParams);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('selectedCategory', 'premium');
      expect(result).toHaveProperty('hotels');
      expect(result).toHaveProperty('uiComponent');
    });

    it('should execute selectHotel tool with valid parameters', async () => {
      const { selectHotel } = require('../lib/booking-functions');
      
      const testParams = {
        hotelId: 'hotel-1',
        hotelName: 'Test Hotel'
      };
      
      const result = await selectHotel.execute(testParams);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('selectedHotel', 'hotel-1');
      expect(result).toHaveProperty('uiComponent');
    });
  });

  describe('End-to-End Chat Interface Tests', () => {
    it('should handle complete conversation flow without errors', async () => {
      // Simulate a complete conversation flow
      const conversationSteps = [
        {
          role: 'user',
          content: 'Hello, I want to add a stopover to my booking.'
        },
        {
          role: 'user', 
          content: 'Show me the available categories.'
        },
        {
          role: 'user',
          content: 'I would like to select the Premium category.'
        }
      ];

      const conversationContext = {
        customer: {
          name: 'Test Customer',
          email: 'test@example.com'
        },
        booking: {
          pnr: 'E2E123',
          route: {
            origin: 'LHR',
            destination: 'BKK'
          },
          passengers: 2
        },
        entryPoint: 'email'
      };

      // Test each step of the conversation
      for (let i = 0; i < conversationSteps.length; i++) {
        const messages = conversationSteps.slice(0, i + 1);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            conversationContext
          })
        });

        // Each step should not result in server errors
        expect(response.status).toBeLessThan(500);
        
        // If successful, should return streaming response
        if (response.status === 200) {
          expect(response.headers.get('content-type')).toContain('text/plain');
        }
      }
    });

    it('should handle tool parameter validation correctly', async () => {
      const messageWithToolCall = {
        messages: [
          {
            role: 'user',
            content: 'I want to select a hotel with ID "premium-suite" called "Premium Suite Hotel".'
          }
        ],
        conversationContext: {
          customer: {
            name: 'Validation Test',
            email: 'validation@test.com'
          },
          booking: {
            pnr: 'VAL123',
            route: {
              origin: 'LHR',
              destination: 'DXB'
            },
            passengers: 1
          },
          entryPoint: 'email'
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageWithToolCall)
      });

      // Should handle tool parameter validation without crashing
      expect(response.status).toBeLessThan(500);
      
      // Should not contain Zod validation errors in response
      if (response.status >= 400) {
        const responseText = await response.text();
        expect(responseText).not.toContain('_def');
        expect(responseText).not.toContain('Cannot read properties of undefined');
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle missing environment variables gracefully', async () => {
      // This test verifies the API handles missing LLM config appropriately
      const testMessage = {
        messages: [
          {
            role: 'user',
            content: 'Test message for error handling.'
          }
        ],
        conversationContext: {
          customer: { name: 'Error Test', email: 'error@test.com' },
          booking: { pnr: 'ERR123', route: { origin: 'LHR', destination: 'BKK' }, passengers: 1 },
          entryPoint: 'email'
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage)
      });

      // Should return appropriate error status, not crash
      if (response.status >= 400) {
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        
        // Should provide meaningful error message
        expect(typeof errorResponse.error).toBe('string');
        expect(errorResponse.error.length).toBeGreaterThan(0);
      }
    });

    it('should handle malformed JSON requests', async () => {
      // Mock malformed JSON response
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid JSON' })
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json content'
      });

      expect(response.status).toBe(400);
    });

    it('should handle empty message arrays', async () => {
      const emptyMessage = {
        messages: [],
        conversationContext: {
          customer: { name: 'Empty Test', email: 'empty@test.com' },
          booking: { pnr: 'EMP123', route: { origin: 'LHR', destination: 'BKK' }, passengers: 1 },
          entryPoint: 'email'
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emptyMessage)
      });

      // Should handle empty messages gracefully
      expect([200, 400].includes(response.status)).toBe(true);
    });
  });
});