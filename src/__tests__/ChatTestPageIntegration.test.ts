import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { spawn, ChildProcess } from 'child_process';
import { execSync } from 'child_process';

// Test configuration
const TEST_PORT = 4323;
const BASE_URL = `http://localhost:${TEST_PORT}`;
const CHAT_TEST_URL = `${BASE_URL}/chat-test`;

describe('Chat Test Page Integration (Live Server)', () => {
  let serverProcess: ChildProcess | null = null;
  let serverReady = false;

  beforeAll(async () => {
    // Skip integration tests in CI or if explicitly disabled
    if (process.env.CI || process.env.SKIP_INTEGRATION_TESTS) {
      console.log('Skipping integration tests in CI environment');
      return;
    }

    console.log('Starting development server for integration tests...');
    
    try {
      // Kill any existing process on the port
      try {
        execSync(`npx kill-port ${TEST_PORT}`, { stdio: 'ignore' });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        // Port might not be in use, continue
      }

      // Start the server
      serverProcess = spawn('npm', ['run', 'dev', '--', '--port', TEST_PORT.toString()], {
        stdio: 'pipe',
        detached: false,
        env: { ...process.env, NODE_ENV: 'test' }
      });

      // Handle server output
      serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') || output.includes(`localhost:${TEST_PORT}`)) {
          serverReady = true;
        }
      });

      serverProcess.stderr?.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      // Wait for server to start
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (!serverReady && attempts < maxAttempts) {
        try {
          const response = await fetch(BASE_URL);
          if (response.status < 500) {
            serverReady = true;
            break;
          }
        } catch (error) {
          // Server not ready yet
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!serverReady) {
        throw new Error('Server failed to start within timeout period');
      }

      console.log('Development server started successfully');
    } catch (error) {
      console.error('Failed to start development server:', error);
      throw error;
    }
  }, 60000); // 60 second timeout

  afterAll(async () => {
    if (serverProcess) {
      console.log('Shutting down development server...');
      
      // Try graceful shutdown first
      serverProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Force kill if still running
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }

    // Clean up port
    try {
      execSync(`npx kill-port ${TEST_PORT}`, { stdio: 'ignore' });
    } catch (error) {
      // Port might already be free
    }
  });

  describe('Live Server Tests', () => {
    it('should load chat-test page successfully', async () => {
      if (!serverReady) {
        console.log('Skipping test - server not ready');
        return;
      }

      const response = await fetch(CHAT_TEST_URL);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      
      const html = await response.text();
      expect(html).toContain('Chat Container Test');
      expect(html).toContain('Qatar Airways Stopover');
    });

    it('should have working chat API endpoint', async () => {
      if (!serverReady) {
        console.log('Skipping test - server not ready');
        return;
      }

      const testMessage = {
        messages: [
          {
            role: 'user',
            content: 'Hello, I would like to test the chat functionality.'
          }
        ],
        conversationContext: {
          customer: {
            name: 'Integration Test User',
            email: 'integration@test.com'
          },
          booking: {
            pnr: 'INT123',
            route: {
              origin: 'LHR',
              destination: 'BKK'
            },
            passengers: 2
          },
          entryPoint: 'email'
        }
      };

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage)
      });

      // Should not return server errors (5xx)
      expect(response.status).toBeLessThan(500);
      
      // Log response for debugging if needed
      if (response.status >= 400) {
        const errorText = await response.text();
        console.log('API Error Response:', errorText);
        
        // Should not contain Zod schema errors
        expect(errorText).not.toContain('_def');
        expect(errorText).not.toContain('Cannot read properties of undefined');
      }
    });

    it('should handle tool calls without schema errors', async () => {
      if (!serverReady) {
        console.log('Skipping test - server not ready');
        return;
      }

      const toolMessage = {
        messages: [
          {
            role: 'user',
            content: 'Please show me the available stopover categories.'
          }
        ],
        conversationContext: {
          customer: {
            name: 'Tool Test User',
            email: 'tool@test.com'
          },
          booking: {
            pnr: 'TOOL123',
            route: {
              origin: 'LHR',
              destination: 'SYD'
            },
            passengers: 1
          },
          entryPoint: 'email'
        }
      };

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolMessage)
      });

      // Should not fail with Zod schema errors
      expect(response.status).not.toBe(500);
      
      if (response.status >= 400) {
        const errorText = await response.text();
        console.log('Tool API Error Response:', errorText);
        
        // Verify no Zod schema validation errors
        expect(errorText).not.toContain('_def');
        expect(errorText).not.toContain('Cannot read properties of undefined');
        expect(errorText).not.toContain('inputSchema');
      }
    });
  });

  describe('Component Integration Tests', () => {
    it('should verify ChatContainer component structure', () => {
      // Test the ChatContainer component directly
      const ChatContainer = require('../components/ChatContainer.tsx').default;
      
      expect(ChatContainer).toBeDefined();
      expect(typeof ChatContainer).toBe('function');
    });

    it('should verify booking functions are properly structured', () => {
      const { bookingFunctions } = require('../lib/booking-functions');
      
      // Verify all tools have correct structure
      const toolNames = [
        'showStopoverCategories',
        'selectStopoverCategory', 
        'selectHotel',
        'selectTimingAndDuration',
        'selectExtras',
        'initiatePayment',
        'completeBooking'
      ];

      toolNames.forEach(toolName => {
        const tool = bookingFunctions[toolName];
        
        expect(tool).toBeDefined();
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('parameters');
        expect(tool).toHaveProperty('execute');
        
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.execute).toBe('function');
        
        // Verify parameters is a Zod schema
        expect(tool.parameters).toBeDefined();
        expect(tool.parameters._def).toBeDefined();
      });
    });

    it('should execute booking functions without errors', async () => {
      const { bookingFunctions } = require('../lib/booking-functions');
      
      // Test showStopoverCategories
      const categoriesResult = await bookingFunctions.showStopoverCategories.execute({});
      expect(categoriesResult.success).toBe(true);
      expect(categoriesResult.categories).toBeDefined();
      expect(categoriesResult.uiComponent).toBeDefined();
      
      // Test selectStopoverCategory
      const categoryResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      expect(categoryResult.success).toBe(true);
      expect(categoryResult.selectedCategory).toBe('premium');
      
      // Test selectHotel
      const hotelResult = await bookingFunctions.selectHotel.execute({
        hotelId: 'hotel-1',
        hotelName: 'Test Hotel'
      });
      expect(hotelResult.success).toBe(true);
      expect(hotelResult.selectedHotel).toBe('hotel-1');
    });
  });
});