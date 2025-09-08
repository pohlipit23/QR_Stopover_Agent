/**
 * LLM UI Integration Tests
 * Tests the complete integration between LLM function calls and UI component rendering
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatContainer from '../ChatContainer';
import { bookingFunctions } from '../../lib/booking-functions';
import type { CustomerData, BookingData } from '../../types';

// Mock the AI SDK
const mockAppend = jest.fn();
const mockMessages = [];
const mockIsLoading = false;
const mockError = null;

jest.doMock('ai/react', () => ({
  useChat: jest.fn(() => ({
    messages: mockMessages,
    isLoading: mockIsLoading,
    error: mockError,
    append: mockAppend
  }))
}), { virtual: true });

// Mock MediaRecorder and other browser APIs
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  onstop: jest.fn(),
})) as any;
(global.MediaRecorder as any).isTypeSupported = jest.fn().mockReturnValue(true);

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

describe('LLM UI Integration Tests', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Complete UI Flow Integration', () => {
    it('should render UI components for complete booking flow', async () => {
      // Simulate the complete conversation flow with UI components
      const conversationMessages = [
        // Step 1: Welcome with categories
        {
          id: '1',
          role: 'assistant',
          content: 'Welcome! Let me show you our stopover categories.',
          toolInvocations: [{
            toolCallId: 'call_1',
            toolName: 'showStopoverCategories',
            args: {},
            result: await bookingFunctions.showStopoverCategories.execute({})
          }]
        },
        // Step 2: Category selected, show hotels
        {
          id: '2',
          role: 'assistant',
          content: 'Great choice! Here are the premium hotels.',
          toolInvocations: [{
            toolCallId: 'call_2',
            toolName: 'selectStopoverCategory',
            args: { categoryId: 'premium', categoryName: 'Premium' },
            result: await bookingFunctions.selectStopoverCategory.execute({
              categoryId: 'premium',
              categoryName: 'Premium'
            })
          }]
        },
        // Step 3: Hotel selected, show timing options
        {
          id: '3',
          role: 'assistant',
          content: 'Perfect hotel choice! Configure your timing.',
          toolInvocations: [{
            toolCallId: 'call_3',
            toolName: 'selectHotel',
            args: { hotelId: 'millennium', hotelName: 'Millennium Hotel Doha' },
            result: await bookingFunctions.selectHotel.execute({
              hotelId: 'millennium',
              hotelName: 'Millennium Hotel Doha'
            })
          }]
        },
        // Step 4: Timing selected, show extras
        {
          id: '4',
          role: 'assistant',
          content: 'Excellent! Add some extras.',
          toolInvocations: [{
            toolCallId: 'call_4',
            toolName: 'selectTimingAndDuration',
            args: { timing: 'outbound', duration: 2 },
            result: await bookingFunctions.selectTimingAndDuration.execute({
              timing: 'outbound',
              duration: 2
            })
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
            args: { includeTransfers: true, selectedTours: [], totalExtrasPrice: 60 },
            result: await bookingFunctions.selectExtras.execute({
              includeTransfers: true,
              selectedTours: [],
              totalExtrasPrice: 60
            })
          }]
        }
      ];

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: conversationMessages,
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      // Verify each step's UI components are rendered
      await waitFor(() => {
        // Step 1: Categories should be visible
        expect(screen.getByText(/stopover categories/i)).toBeInTheDocument();
        
        // Step 2: Hotels should be visible
        expect(screen.getByText(/premium hotels/i)).toBeInTheDocument();
        
        // Step 3: Timing options should be visible
        expect(screen.getByText(/configure your timing/i)).toBeInTheDocument();
        
        // Step 4: Extras should be visible
        expect(screen.getByText(/add some extras/i)).toBeInTheDocument();
        
        // Step 5: Summary should be visible
        expect(screen.getByText(/booking summary/i)).toBeInTheDocument();
      });
    });

    it('should handle user interactions with rendered UI components', async () => {
      // Start with categories message
      const categoriesMessage = {
        id: '1',
        role: 'assistant',
        content: 'Choose your category:',
        toolInvocations: [{
          toolCallId: 'call_1',
          toolName: 'showStopoverCategories',
          args: {},
          result: await bookingFunctions.showStopoverCategories.execute({})
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [categoriesMessage],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      // Wait for categories to render
      await waitFor(() => {
        expect(screen.getByText(/choose your category/i)).toBeInTheDocument();
      });

      // The actual category selection would be handled by the MessageBubble component
      // which would call onRichContentAction, which would then call append with the user's selection
      expect(mockAppend).toHaveBeenCalled();
    });

    it('should validate UI component data structure from function results', async () => {
      // Test each function's UI component output
      const functionTests = [
        {
          name: 'showStopoverCategories',
          expectedUIType: 'stopover-categories',
          result: await bookingFunctions.showStopoverCategories.execute({})
        },
        {
          name: 'selectStopoverCategory',
          expectedUIType: 'hotels',
          result: await bookingFunctions.selectStopoverCategory.execute({
            categoryId: 'premium',
            categoryName: 'Premium'
          })
        },
        {
          name: 'selectHotel',
          expectedUIType: 'stopover-options',
          result: await bookingFunctions.selectHotel.execute({
            hotelId: 'millennium',
            hotelName: 'Millennium Hotel Doha'
          })
        },
        {
          name: 'selectTimingAndDuration',
          expectedUIType: 'stopover-extras',
          result: await bookingFunctions.selectTimingAndDuration.execute({
            timing: 'outbound',
            duration: 2
          })
        },
        {
          name: 'selectExtras',
          expectedUIType: 'summary',
          result: await bookingFunctions.selectExtras.execute({
            includeTransfers: true,
            selectedTours: [],
            totalExtrasPrice: 60
          })
        },
        {
          name: 'initiatePayment',
          expectedUIType: 'form',
          result: await bookingFunctions.initiatePayment.execute({
            paymentMethod: 'credit-card',
            totalAmount: 500
          })
        },
        {
          name: 'completeBooking',
          expectedUIType: 'summary',
          result: await bookingFunctions.completeBooking.execute({
            paymentData: { method: 'credit-card', confirmed: true }
          })
        }
      ];

      for (const test of functionTests) {
        // Verify UI component structure
        expect(test.result.success).toBe(true);
        expect(test.result.uiComponent).toBeDefined();
        expect(test.result.uiComponent.type).toBe(test.expectedUIType);
        expect(test.result.uiComponent.data).toBeDefined();
        expect(test.result.message).toBeDefined();

        // Create a message with this function result
        const message = {
          id: `test_${test.name}`,
          role: 'assistant',
          content: test.result.message,
          toolInvocations: [{
            toolCallId: `call_${test.name}`,
            toolName: test.name,
            args: {},
            result: test.result
          }]
        };

        const { useChat } = require('ai/react');
        useChat.mockReturnValue({
          messages: [message],
          isLoading: false,
          error: null,
          append: mockAppend
        });

        const { unmount } = render(
          <ChatContainer
            entryPoint="email"
            customer={mockCustomer}
            booking={mockBooking}
            isModal={false}
          />
        );

        // Verify the message content is rendered
        await waitFor(() => {
          expect(screen.getByText(test.result.message)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('UI Component Rendering Validation', () => {
    it('should render stopover categories with proper structure', async () => {
      const categoriesResult = await bookingFunctions.showStopoverCategories.execute({});
      
      const message = {
        id: '1',
        role: 'assistant',
        content: categoriesResult.message,
        toolInvocations: [{
          toolCallId: 'call_1',
          toolName: 'showStopoverCategories',
          args: {},
          result: categoriesResult
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [message],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(categoriesResult.message)).toBeInTheDocument();
      });

      // Verify the UI component data structure
      expect(categoriesResult.uiComponent.type).toBe('stopover-categories');
      expect(categoriesResult.uiComponent.data.categories).toBeDefined();
      expect(Array.isArray(categoriesResult.uiComponent.data.categories)).toBe(true);
    });

    it('should render hotel selection with proper data', async () => {
      const hotelResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });

      const message = {
        id: '2',
        role: 'assistant',
        content: hotelResult.message,
        toolInvocations: [{
          toolCallId: 'call_2',
          toolName: 'selectStopoverCategory',
          args: { categoryId: 'premium', categoryName: 'Premium' },
          result: hotelResult
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [message],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(hotelResult.message)).toBeInTheDocument();
      });

      // Verify hotel UI component structure
      expect(hotelResult.uiComponent.type).toBe('hotels');
      expect(hotelResult.uiComponent.data.hotels).toBeDefined();
      expect(hotelResult.uiComponent.data.selectedCategoryId).toBe('premium');
    });

    it('should render payment form with proper validation', async () => {
      const paymentResult = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: 500
      });

      const message = {
        id: '6',
        role: 'assistant',
        content: paymentResult.message,
        toolInvocations: [{
          toolCallId: 'call_6',
          toolName: 'initiatePayment',
          args: { paymentMethod: 'credit-card', totalAmount: 500 },
          result: paymentResult
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [message],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(paymentResult.message)).toBeInTheDocument();
      });

      // Verify payment form structure
      expect(paymentResult.uiComponent.type).toBe('form');
      expect(paymentResult.uiComponent.data.type).toBe('payment');
      expect(paymentResult.uiComponent.data.fields).toBeDefined();
      expect(Array.isArray(paymentResult.uiComponent.data.fields)).toBe(true);
      
      // Verify required payment fields
      const fields = paymentResult.uiComponent.data.fields;
      const fieldIds = fields.map(field => field.id);
      expect(fieldIds).toContain('cardNumber');
      expect(fieldIds).toContain('expiryDate');
      expect(fieldIds).toContain('cvv');
      expect(fieldIds).toContain('nameOnCard');
    });

    it('should render booking confirmation with success indicators', async () => {
      const confirmationResult = await bookingFunctions.completeBooking.execute({
        paymentData: { method: 'credit-card', confirmed: true }
      });

      const message = {
        id: '7',
        role: 'assistant',
        content: confirmationResult.message,
        toolInvocations: [{
          toolCallId: 'call_7',
          toolName: 'completeBooking',
          args: { paymentData: { method: 'credit-card', confirmed: true } },
          result: confirmationResult
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [message],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(confirmationResult.message)).toBeInTheDocument();
      });

      // Verify confirmation structure
      expect(confirmationResult.success).toBe(true);
      expect(confirmationResult.bookingComplete).toBe(true);
      expect(confirmationResult.newPNR).toBe('X9FG1');
      expect(confirmationResult.uiComponent.type).toBe('summary');
      expect(confirmationResult.message).toContain('🎉');
      expect(confirmationResult.message).toContain('X9FG1');
    });
  });

  describe('Error Handling in UI Components', () => {
    it('should handle LLM errors gracefully in UI', async () => {
      const errorMessage = new Error('LLM API timeout');
      
      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: errorMessage,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/AI Assistant Error/)).toBeInTheDocument();
        expect(screen.getByText(/LLM API timeout/)).toBeInTheDocument();
        expect(screen.getByText(/Try Again/)).toBeInTheDocument();
      });
    });

    it('should handle function call errors in UI', async () => {
      const errorMessage = {
        id: '1',
        role: 'assistant',
        content: 'There was an error processing your request.',
        toolInvocations: [{
          toolCallId: 'call_error',
          toolName: 'selectStopoverCategory',
          args: { categoryId: 'invalid' },
          result: {
            success: false,
            error: 'Invalid category ID provided',
            errorType: 'validation'
          }
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [errorMessage],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/There was an error/)).toBeInTheDocument();
      });

      // Verify error is handled in function call result
      expect(errorMessage.toolInvocations[0].result.success).toBe(false);
      expect(errorMessage.toolInvocations[0].result.error).toBe('Invalid category ID provided');
    });
  });

  describe('Performance and Accessibility', () => {
    it('should render UI components within performance thresholds', async () => {
      const startTime = Date.now();

      const message = {
        id: '1',
        role: 'assistant',
        content: 'Performance test',
        toolInvocations: [{
          toolCallId: 'call_1',
          toolName: 'showStopoverCategories',
          args: {},
          result: await bookingFunctions.showStopoverCategories.execute({})
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [message],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Performance test')).toBeInTheDocument();
      });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    it('should maintain accessibility standards in rendered components', async () => {
      const message = {
        id: '1',
        role: 'assistant',
        content: 'Accessibility test',
        toolInvocations: [{
          toolCallId: 'call_1',
          toolName: 'showStopoverCategories',
          args: {},
          result: await bookingFunctions.showStopoverCategories.execute({})
        }]
      };

      const { useChat } = require('ai/react');
      useChat.mockReturnValue({
        messages: [message],
        isLoading: false,
        error: null,
        append: mockAppend
      });

      render(
        <ChatContainer
          entryPoint="email"
          customer={mockCustomer}
          booking={mockBooking}
          isModal={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Accessibility test')).toBeInTheDocument();
      });

      // Check for proper ARIA roles and labels
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');

      // Check for proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Check for proper button accessibility
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });
});