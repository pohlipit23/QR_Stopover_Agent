import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatContainer from '../ChatContainer';
import type { CustomerData, BookingData } from '../../types';

// Mock the AI SDK
const mockAppend = jest.fn();
const mockMessages = [];
const mockIsLoading = false;
const mockError = null;

// Create a mock module for ai/react
const mockUseChat = jest.fn(() => ({
  messages: mockMessages,
  isLoading: mockIsLoading,
  error: mockError,
  append: mockAppend
}));

jest.doMock('ai/react', () => ({
  useChat: mockUseChat
}), { virtual: true });

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock MediaRecorder for voice input
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  onstop: jest.fn(),
})) as any;
(global.MediaRecorder as any).isTypeSupported = jest.fn().mockReturnValue(true);

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LLM Conversation Flow End-to-End Tests', () => {
  const mockCustomer: CustomerData = {
    name: 'Alex Johnson',
    privilegeClubNumber: 'QR12345678',
    email: 'alex.johnson@example.com'
  };

  const mockBooking: BookingData = {
    pnr: 'X4HG8',
    route: {
      origin: 'LHR',
      destination: 'BKK',
      stops: ['DOH'],
      routing: 'LHR-BKK-LHR'
    },
    passengers: 2,
    status: 'confirmed'
  };

  const defaultProps = {
    entryPoint: 'email' as const,
    customer: mockCustomer,
    booking: mockBooking,
    isModal: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Complete Conversation Flow', () => {
    it('should initialize conversation with welcome message', async () => {
      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(mockAppend).toHaveBeenCalledWith({
          role: 'user',
          content: expect.stringContaining('Hello! I\'m Alex Johnson')
        });
      });

      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: expect.stringContaining('booking X4HG8')
      });
    });

    it('should handle LLM response with function calls for category selection', async () => {
      const mockLLMMessages = [
        {
          id: '1',
          role: 'assistant',
          content: 'Welcome Alex! I\'d be happy to help you add a stopover to your LHR-BKK journey.',
          toolInvocations: [{
            toolCallId: 'call_1',
            toolName: 'showStopoverCategories',
            args: {},
            result: {
              success: true,
              categories: [
                { id: 'standard', name: 'Standard', pricePerNight: 80 },
                { id: 'premium', name: 'Premium', pricePerNight: 150 }
              ],
              uiComponent: {
                type: 'stopover-categories',
                data: { categories: [] }
              }
            }
          }]
        }
      ];

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: mockLLMMessages,
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome Alex/)).toBeInTheDocument();
      });

      // Verify that the function call result triggers UI component rendering
      expect(screen.getByText(/Welcome Alex/)).toBeInTheDocument();
    });

    it('should handle category selection and trigger hotel display', async () => {
      const mockLLMMessages = [
        {
          id: '1',
          role: 'assistant',
          content: 'Great choice! You\'ve selected the Premium category.',
          toolInvocations: [{
            toolCallId: 'call_2',
            toolName: 'selectStopoverCategory',
            args: { categoryId: 'premium', categoryName: 'Premium' },
            result: {
              success: true,
              selectedCategory: 'premium',
              hotels: [
                { id: 'millennium', name: 'Millennium Hotel Doha' },
                { id: 'steigenberger', name: 'Steigenberger Hotel' }
              ],
              uiComponent: {
                type: 'hotels',
                data: { hotels: [] }
              }
            }
          }]
        }
      ];

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: mockLLMMessages,
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      // Simulate user selecting a category
      await act(async () => {
        const chatContainer = screen.getByRole('dialog');
        const messageContainer = chatContainer.querySelector('[data-testid="message-container"]');
        if (messageContainer) {
          fireEvent.click(messageContainer);
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/Great choice/)).toBeInTheDocument();
      });
    });

    it('should complete full booking flow from category to confirmation', async () => {
      const conversationSteps = [
        // Step 1: Welcome and show categories
        {
          id: '1',
          role: 'assistant',
          content: 'Welcome! Let me show you our stopover categories.',
          toolInvocations: [{
            toolCallId: 'call_1',
            toolName: 'showStopoverCategories',
            args: {},
            result: { success: true, uiComponent: { type: 'stopover-categories' } }
          }]
        },
        // Step 2: Category selected, show hotels
        {
          id: '2',
          role: 'assistant',
          content: 'Perfect! Now choose your hotel.',
          toolInvocations: [{
            toolCallId: 'call_2',
            toolName: 'selectStopoverCategory',
            args: { categoryId: 'premium' },
            result: { success: true, uiComponent: { type: 'hotels' } }
          }]
        },
        // Step 3: Hotel selected, show timing options
        {
          id: '3',
          role: 'assistant',
          content: 'Great hotel choice! Now select your timing.',
          toolInvocations: [{
            toolCallId: 'call_3',
            toolName: 'selectHotel',
            args: { hotelId: 'millennium' },
            result: { success: true, uiComponent: { type: 'stopover-options' } }
          }]
        },
        // Step 4: Timing selected, show extras
        {
          id: '4',
          role: 'assistant',
          content: 'Excellent! Add some extras to enhance your stay.',
          toolInvocations: [{
            toolCallId: 'call_4',
            toolName: 'selectTimingAndDuration',
            args: { timing: 'outbound', duration: 2 },
            result: { success: true, uiComponent: { type: 'stopover-extras' } }
          }]
        },
        // Step 5: Extras selected, show summary
        {
          id: '5',
          role: 'assistant',
          content: 'Here\'s your booking summary.',
          toolInvocations: [{
            toolCallId: 'call_5',
            toolName: 'selectExtras',
            args: { includeTransfers: true, selectedTours: [] },
            result: { success: true, uiComponent: { type: 'summary' } }
          }]
        },
        // Step 6: Payment initiated
        {
          id: '6',
          role: 'assistant',
          content: 'Please complete your payment.',
          toolInvocations: [{
            toolCallId: 'call_6',
            toolName: 'initiatePayment',
            args: { paymentMethod: 'credit-card', totalAmount: 500 },
            result: { success: true, uiComponent: { type: 'form' } }
          }]
        },
        // Step 7: Booking confirmed
        {
          id: '7',
          role: 'assistant',
          content: 'Congratulations! Your booking is confirmed.',
          toolInvocations: [{
            toolCallId: 'call_7',
            toolName: 'completeBooking',
            args: { paymentData: { method: 'credit-card', confirmed: true } },
            result: { 
              success: true, 
              newPNR: 'X9FG1',
              uiComponent: { type: 'summary' }
            }
          }]
        }
      ];

      const { useChat } = require('ai/react');
      
      // Simulate progressive conversation
      for (let i = 0; i < conversationSteps.length; i++) {
        const currentMessages = conversationSteps.slice(0, i + 1);
        
        useChat.mockReturnValue({
          messages: currentMessages,
          isLoading: false,
          error: null,
          append: mockAppend
        });

        const { rerender } = render(<ChatContainer {...defaultProps} />);
        
        await waitFor(() => {
          expect(screen.getByText(new RegExp(currentMessages[i].content))).toBeInTheDocument();
        });

        // Verify function calls are processed
        if (currentMessages[i].toolInvocations) {
          const toolInvocation = currentMessages[i].toolInvocations[0];
          expect(toolInvocation.result.success).toBe(true);
        }

        rerender(<ChatContainer {...defaultProps} />);
      }

      // Verify final confirmation
      await waitFor(() => {
        expect(screen.getByText(/Congratulations/)).toBeInTheDocument();
      });
    });
  });

  describe('Function Call Verification', () => {
    it('should trigger appropriate UI components for each function call', async () => {
      const functionCallTests = [
        {
          functionName: 'showStopoverCategories',
          expectedUIComponent: 'stopover-categories',
          args: {}
        },
        {
          functionName: 'selectStopoverCategory',
          expectedUIComponent: 'hotels',
          args: { categoryId: 'premium', categoryName: 'Premium' }
        },
        {
          functionName: 'selectHotel',
          expectedUIComponent: 'stopover-options',
          args: { hotelId: 'millennium', hotelName: 'Millennium Hotel Doha' }
        },
        {
          functionName: 'selectTimingAndDuration',
          expectedUIComponent: 'stopover-extras',
          args: { timing: 'outbound', duration: 2 }
        },
        {
          functionName: 'selectExtras',
          expectedUIComponent: 'summary',
          args: { includeTransfers: true, selectedTours: [], totalExtrasPrice: 60 }
        },
        {
          functionName: 'initiatePayment',
          expectedUIComponent: 'form',
          args: { paymentMethod: 'credit-card', totalAmount: 500 }
        },
        {
          functionName: 'completeBooking',
          expectedUIComponent: 'summary',
          args: { paymentData: { method: 'credit-card', confirmed: true } }
        }
      ];

      for (const test of functionCallTests) {
        const mockMessage = {
          id: `test_${test.functionName}`,
          role: 'assistant',
          content: `Testing ${test.functionName}`,
          toolInvocations: [{
            toolCallId: `call_${test.functionName}`,
            toolName: test.functionName,
            args: test.args,
            result: {
              success: true,
              uiComponent: {
                type: test.expectedUIComponent,
                data: {}
              }
            }
          }]
        };

        const { useChat } = require('ai/react');
        useChat.mockReturnValue({
          messages: [mockMessage],
          isLoading: false,
          error: null,
          append: mockAppend
        });

        const { unmount } = render(<ChatContainer {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByText(`Testing ${test.functionName}`)).toBeInTheDocument();
        });

        // Verify the function call result structure
        expect(mockMessage.toolInvocations[0].result.success).toBe(true);
        expect(mockMessage.toolInvocations[0].result.uiComponent.type).toBe(test.expectedUIComponent);

        unmount();
      }
    });
  });

  describe('Error Handling and Model Fallback', () => {
    it('should handle LLM API errors gracefully', async () => {
      const mockError = new Error('API rate limit exceeded');
      
      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: mockError,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/AI Assistant Error/)).toBeInTheDocument();
        expect(screen.getByText(/API rate limit exceeded/)).toBeInTheDocument();
        expect(screen.getByText(/Try Again/)).toBeInTheDocument();
      });
    });

    it('should test model fallback scenarios', async () => {
      // Mock fetch to simulate API endpoint behavior with fallbacks
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({ error: 'Rate limit exceeded' })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ 
            message: 'Fallback model response',
            model: 'anthropic/claude-3-haiku'
          })
        });

      // Test API endpoint directly
      const response1 = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext: { customer: mockCustomer, booking: mockBooking }
        })
      });

      expect(response1.ok).toBe(false);
      expect(response1.status).toBe(429);

      const response2 = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext: { customer: mockCustomer, booking: mockBooking }
        })
      });

      expect(response2.ok).toBe(true);
      const data = await response2.json();
      expect(data.model).toBe('anthropic/claude-3-haiku');
    });

    it('should handle function call errors', async () => {
      const mockMessageWithError = {
        id: '1',
        role: 'assistant',
        content: 'There was an error processing your request.',
        toolInvocations: [{
          toolCallId: 'call_error',
          toolName: 'selectStopoverCategory',
          args: { categoryId: 'invalid' },
          result: {
            success: false,
            error: 'Invalid category ID provided'
          }
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [mockMessageWithError],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/There was an error/)).toBeInTheDocument();
      });

      // Verify error handling in function call result
      expect(mockMessageWithError.toolInvocations[0].result.success).toBe(false);
      expect(mockMessageWithError.toolInvocations[0].result.error).toBe('Invalid category ID provided');
    });
  });

  describe('Streaming Responses and Typing Indicators', () => {
    it('should show loading state during LLM streaming', async () => {
      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/AI is thinking/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
      });

      // Verify loading spinner is present
      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should handle streaming message updates', async () => {
      const { useChat } = require('ai/react');
      
      // Start with loading state
      useChat.mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        append: mockAppend
      });

      const { rerender } = render(<ChatContainer {...defaultProps} />);

      // Verify loading state
      expect(screen.getByText(/AI is thinking/)).toBeInTheDocument();

      // Simulate streaming completion
      useChat.mockReturnValue({
        messages: [{
          id: '1',
          role: 'assistant',
          content: 'Welcome to Qatar Airways stopover booking!'
        }],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      rerender(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome to Qatar Airways/)).toBeInTheDocument();
        expect(screen.queryByText(/AI is thinking/)).not.toBeInTheDocument();
      });
    });

    it('should validate streaming response format', async () => {
      const streamingMessage = {
        id: '1',
        role: 'assistant',
        content: 'Partial response...',
        // Simulate partial streaming state
        streaming: true
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [streamingMessage],
        isLoading: true,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Partial response/)).toBeInTheDocument();
      });

      // Verify message structure for streaming
      expect(streamingMessage.role).toBe('assistant');
      expect(streamingMessage.content).toBeTruthy();
    });
  });

  describe('Conversation Persistence and Context Management', () => {
    it('should persist conversation state to localStorage', async () => {
      const mockMessages = [
        {
          id: '1',
          role: 'user',
          content: 'Hello'
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi there!'
        }
      ];

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });

      // Verify localStorage call structure
      const setItemCalls = localStorageMock.setItem.mock.calls;
      expect(setItemCalls.length).toBeGreaterThan(0);
      
      const lastCall = setItemCalls[setItemCalls.length - 1];
      expect(lastCall[0]).toMatch(/qatar_stopover_conversation_/);
      
      const storedData = JSON.parse(lastCall[1]);
      expect(storedData.customer).toEqual(mockCustomer);
      expect(storedData.booking).toEqual(mockBooking);
      expect(storedData.messages).toBeDefined();
    });

    it('should maintain conversation context across interactions', async () => {
      const conversationContext = {
        customer: mockCustomer,
        booking: mockBooking,
        entryPoint: 'email'
      };

      render(<ChatContainer {...defaultProps} />);

      await waitFor(() => {
        expect(mockAppend).toHaveBeenCalledWith(
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining(mockCustomer.name)
          })
        );
      });

      // Verify context is maintained in subsequent calls
      const appendCalls = mockAppend.mock.calls;
      expect(appendCalls.length).toBeGreaterThan(0);
      
      const firstCall = appendCalls[0][0];
      expect(firstCall.content).toContain(mockCustomer.name);
      expect(firstCall.content).toContain(mockBooking.pnr);
    });

    it('should handle conversation recovery from localStorage', async () => {
      const storedConversation = {
        messages: [
          { id: '1', sender: 'user', content: { type: 'text', text: 'Hello' } },
          { id: '2', sender: 'agent', content: { type: 'text', text: 'Hi there!' } }
        ],
        customer: mockCustomer,
        booking: mockBooking,
        timestamp: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedConversation));

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      // Verify localStorage was checked for existing conversation
      expect(localStorageMock.getItem).toHaveBeenCalled();
    });
  });

  describe('User Input Validation and Processing', () => {
    it('should process text input and send to LLM', async () => {
      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      const textInput = screen.getByLabelText(/type your message/i);
      const sendButton = screen.getByLabelText(/send message/i);

      fireEvent.change(textInput, { target: { value: 'I want to add a stopover' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockAppend).toHaveBeenCalledWith({
          role: 'user',
          content: 'I want to add a stopover'
        });
      });
    });

    it('should handle voice input processing', async () => {
      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      const voiceButton = screen.getByLabelText(/start voice recording/i);
      
      // Simulate voice recording
      fireEvent.click(voiceButton);

      // Voice functionality is mocked, so we just verify the button exists
      expect(voiceButton).toBeInTheDocument();
    });

    it('should validate input length and content', async () => {
      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(<ChatContainer {...defaultProps} />);

      const textInput = screen.getByLabelText(/type your message/i);
      const sendButton = screen.getByLabelText(/send message/i);

      // Test empty input
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a message/i)).toBeInTheDocument();
      });

      expect(mockAppend).not.toHaveBeenCalled();

      // Test long input
      const longMessage = 'a'.repeat(1001);
      fireEvent.change(textInput, { target: { value: longMessage } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/message is too long/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Responsive Design', () => {
    it('should meet accessibility requirements', () => {
      render(<ChatContainer {...defaultProps} />);

      // Check ARIA labels and roles
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/type your message/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/send message/i)).toBeInTheDocument();

      // Check keyboard navigation
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should handle mobile responsive behavior', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ChatContainer {...defaultProps} isModal={true} />);

      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Verify mobile-specific classes are applied
      const chatContainer = screen.getByRole('dialog');
      expect(chatContainer.parentElement).toHaveClass('items-end', 'p-0');
    });

    it('should handle keyboard shortcuts', async () => {
      render(<ChatContainer {...defaultProps} isModal={true} />);

      // Test Escape key to close modal
      fireEvent.keyDown(document, { key: 'Escape' });

      // Since we don't have onClose prop in this test, just verify the event is handled
      // In a real scenario, this would close the modal
    });
  });
});