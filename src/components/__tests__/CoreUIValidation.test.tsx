/**
 * Core UI Validation Tests
 * Focuses on validating that LLM function calls produce the correct UI components
 * without getting caught up in specific implementation details
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBubble from '../MessageBubble';
import { bookingFunctions } from '../../lib/booking-functions';
import type { Message } from '../../types';

describe('Core UI Validation for LLM Function Calls', () => {
  const mockTimestamp = new Date('2024-01-01T12:00:00Z');

  describe('LLM Function Call to UI Component Mapping', () => {
    it('should render stopover categories UI from showStopoverCategories function', async () => {
      // Execute the actual LLM function
      const functionResult = await bookingFunctions.showStopoverCategories.execute({});
      
      // Verify function returns UI component data
      expect(functionResult.success).toBe(true);
      expect(functionResult.uiComponent.type).toBe('stopover-categories');
      expect(functionResult.uiComponent.data.categories).toBeDefined();
      expect(Array.isArray(functionResult.uiComponent.data.categories)).toBe(true);
      
      // Create message with function result
      const message: Message = {
        id: '1',
        sender: 'agent',
        content: {
          type: 'rich',
          text: functionResult.message,
          richContent: functionResult.uiComponent
        },
        timestamp: mockTimestamp
      };

      // Render the message
      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      // Verify the message text is rendered
      expect(screen.getByText(functionResult.message)).toBeInTheDocument();
      
      // Verify UI component type is correct
      expect(functionResult.uiComponent.type).toBe('stopover-categories');
    });

    it('should render hotels UI from selectStopoverCategory function', async () => {
      const functionResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      
      expect(functionResult.success).toBe(true);
      expect(functionResult.uiComponent.type).toBe('hotels');
      expect(functionResult.uiComponent.data.hotels).toBeDefined();
      expect(functionResult.uiComponent.data.selectedCategoryId).toBe('premium');
      
      const message: Message = {
        id: '2',
        sender: 'agent',
        content: {
          type: 'rich',
          text: functionResult.message,
          richContent: functionResult.uiComponent
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText(functionResult.message)).toBeInTheDocument();
      expect(functionResult.uiComponent.type).toBe('hotels');
    });

    it('should render stopover options UI from selectHotel function', async () => {
      const functionResult = await bookingFunctions.selectHotel.execute({
        hotelId: 'millennium',
        hotelName: 'Millennium Hotel Doha'
      });
      
      expect(functionResult.success).toBe(true);
      expect(functionResult.uiComponent.type).toBe('stopover-options');
      expect(functionResult.uiComponent.data.selectedHotelId).toBe('millennium');
      
      const message: Message = {
        id: '3',
        sender: 'agent',
        content: {
          type: 'rich',
          text: functionResult.message,
          richContent: functionResult.uiComponent
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText(functionResult.message)).toBeInTheDocument();
      expect(functionResult.uiComponent.type).toBe('stopover-options');
    });

    it('should render extras UI from selectTimingAndDuration function', async () => {
      const functionResult = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound',
        duration: 2
      });
      
      expect(functionResult.success).toBe(true);
      expect(functionResult.uiComponent.type).toBe('stopover-extras');
      expect(functionResult.selectedTiming).toBe('outbound');
      expect(functionResult.selectedDuration).toBe(2);
      
      const message: Message = {
        id: '4',
        sender: 'agent',
        content: {
          type: 'rich',
          text: functionResult.message,
          richContent: functionResult.uiComponent
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText(functionResult.message)).toBeInTheDocument();
      expect(functionResult.uiComponent.type).toBe('stopover-extras');
    });

    it('should render summary UI from selectExtras function', async () => {
      const functionResult = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [],
        totalExtrasPrice: 60
      });
      
      expect(functionResult.success).toBe(true);
      expect(functionResult.uiComponent.type).toBe('summary');
      expect(functionResult.selectedExtras.transfers).toBe(true);
      expect(functionResult.pricing.totalCashPrice).toBeGreaterThan(0);
      
      const message: Message = {
        id: '5',
        sender: 'agent',
        content: {
          type: 'rich',
          text: functionResult.message,
          richContent: functionResult.uiComponent
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText(functionResult.message)).toBeInTheDocument();
      expect(functionResult.uiComponent.type).toBe('summary');
    });

    it('should render payment form UI from initiatePayment function', async () => {
      const functionResult = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: 500
      });
      
      expect(functionResult.success).toBe(true);
      expect(functionResult.uiComponent.type).toBe('form');
      expect(functionResult.uiComponent.data.type).toBe('payment');
      expect(Array.isArray(functionResult.uiComponent.data.fields)).toBe(true);
      
      const message: Message = {
        id: '6',
        sender: 'agent',
        content: {
          type: 'form',
          text: functionResult.message,
          formData: functionResult.uiComponent.data
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText(functionResult.message)).toBeInTheDocument();
      expect(functionResult.uiComponent.type).toBe('form');
    });

    it('should render confirmation UI from completeBooking function', async () => {
      const functionResult = await bookingFunctions.completeBooking.execute({
        paymentData: { method: 'credit-card', confirmed: true }
      });
      
      expect(functionResult.success).toBe(true);
      expect(functionResult.uiComponent.type).toBe('summary');
      expect(functionResult.bookingComplete).toBe(true);
      expect(functionResult.newPNR).toBe('X9FG1');
      
      const message: Message = {
        id: '7',
        sender: 'agent',
        content: {
          type: 'rich',
          text: functionResult.message,
          richContent: functionResult.uiComponent
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText(functionResult.message)).toBeInTheDocument();
      expect(functionResult.uiComponent.type).toBe('summary');
      expect(functionResult.message).toContain('🎉');
      expect(functionResult.message).toContain('X9FG1');
    });
  });

  describe('UI Component Data Structure Validation', () => {
    it('should validate stopover categories data structure', async () => {
      const result = await bookingFunctions.showStopoverCategories.execute({});
      
      expect(result.uiComponent.data).toEqual({
        categories: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            category: expect.any(String),
            pricePerNight: expect.any(Number),
            amenities: expect.any(Array),
            image: expect.any(String)
          })
        ])
      });
    });

    it('should validate hotel selection data structure', async () => {
      const result = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      
      expect(result.uiComponent.data).toEqual({
        hotels: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            category: expect.any(String),
            pricePerNight: expect.any(Number),
            amenities: expect.any(Array),
            image: expect.any(String)
          })
        ]),
        selectedCategoryId: 'premium'
      });
    });

    it('should validate payment form data structure', async () => {
      const result = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: 500
      });
      
      expect(result.uiComponent.data).toEqual({
        type: 'payment',
        fields: expect.arrayContaining([
          expect.objectContaining({
            id: 'cardNumber',
            type: 'text',
            label: 'Card Number',
            required: true
          }),
          expect.objectContaining({
            id: 'expiryDate',
            type: 'text',
            label: 'Expiry Date (MM/YY)',
            required: true
          }),
          expect.objectContaining({
            id: 'cvv',
            type: 'text',
            label: 'CVV',
            required: true
          }),
          expect.objectContaining({
            id: 'nameOnCard',
            type: 'text',
            label: 'Name on Card',
            required: true
          })
        ]),
        submitLabel: 'Pay Now'
      });
    });

    it('should validate pricing data consistency', async () => {
      const result = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [
          { tourId: 'whale-sharks', tourName: 'Whale Sharks', quantity: 2, totalPrice: 390 }
        ],
        totalExtrasPrice: 450
      });
      
      expect(result.pricing).toEqual({
        hotelCost: 300, // 2 nights * $150
        flightFareDifference: 115,
        transfersCost: 60,
        toursCost: 390,
        totalCashPrice: 865, // 300 + 115 + 60 + 390
        totalAviosPrice: 108125 // 865 * 125
      });
    });
  });

  describe('Complete Flow UI Validation', () => {
    it('should validate complete conversation flow produces correct UI sequence', async () => {
      // Execute complete flow and validate UI component types
      const step1 = await bookingFunctions.showStopoverCategories.execute({});
      const step2 = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium', categoryName: 'Premium'
      });
      const step3 = await bookingFunctions.selectHotel.execute({
        hotelId: 'millennium', hotelName: 'Millennium Hotel Doha'
      });
      const step4 = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound', duration: 2
      });
      const step5 = await bookingFunctions.selectExtras.execute({
        includeTransfers: true, selectedTours: [], totalExtrasPrice: 60
      });
      const step6 = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card', totalAmount: step5.pricing.totalCashPrice
      });
      const step7 = await bookingFunctions.completeBooking.execute({
        paymentData: { method: 'credit-card', confirmed: true }
      });

      // Validate UI component sequence
      const expectedUISequence = [
        'stopover-categories',
        'hotels', 
        'stopover-options',
        'stopover-extras',
        'summary',
        'form',
        'summary'
      ];

      const actualUISequence = [
        step1.uiComponent.type,
        step2.uiComponent.type,
        step3.uiComponent.type,
        step4.uiComponent.type,
        step5.uiComponent.type,
        step6.uiComponent.type,
        step7.uiComponent.type
      ];

      expect(actualUISequence).toEqual(expectedUISequence);

      // Validate all steps succeeded
      [step1, step2, step3, step4, step5, step6, step7].forEach(step => {
        expect(step.success).toBe(true);
        expect(step.uiComponent).toBeDefined();
        expect(step.message).toBeDefined();
      });

      // Validate data consistency across steps
      expect(step2.selectedCategory).toBe('premium');
      expect(step3.selectedHotel).toBe('millennium');
      expect(step4.selectedTiming).toBe('outbound');
      expect(step4.selectedDuration).toBe(2);
      expect(step7.newPNR).toBe('X9FG1');
    });

    it('should validate UI components render without errors', async () => {
      // Test that each UI component can be rendered without throwing errors
      const functionResults = [
        await bookingFunctions.showStopoverCategories.execute({}),
        await bookingFunctions.selectStopoverCategory.execute({ categoryId: 'premium', categoryName: 'Premium' }),
        await bookingFunctions.selectHotel.execute({ hotelId: 'millennium', hotelName: 'Millennium' }),
        await bookingFunctions.selectTimingAndDuration.execute({ timing: 'outbound', duration: 2 }),
        await bookingFunctions.selectExtras.execute({ includeTransfers: true, selectedTours: [], totalExtrasPrice: 60 }),
        await bookingFunctions.initiatePayment.execute({ paymentMethod: 'credit-card', totalAmount: 500 }),
        await bookingFunctions.completeBooking.execute({ paymentData: { method: 'credit-card', confirmed: true } })
      ];

      functionResults.forEach((result, index) => {
        const message: Message = {
          id: `test_${index}`,
          sender: 'agent',
          content: result.uiComponent.type === 'form' ? {
            type: 'form',
            text: result.message,
            formData: result.uiComponent.data
          } : {
            type: 'rich',
            text: result.message,
            richContent: result.uiComponent
          },
          timestamp: mockTimestamp
        };

        // Should render without throwing errors
        expect(() => {
          render(
            <MessageBubble
              message={message}
              sender="agent"
              timestamp={mockTimestamp}
            />
          );
        }).not.toThrow();
      });
    });
  });

  describe('Error Handling in UI Components', () => {
    it('should handle missing UI component data gracefully', () => {
      const messageWithMissingData: Message = {
        id: 'error_test',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Error test message',
          richContent: {
            type: 'stopover-categories',
            data: {} // Missing categories array
          }
        },
        timestamp: mockTimestamp
      };

      // Should render without throwing errors even with missing data
      expect(() => {
        render(
          <MessageBubble
            message={messageWithMissingData}
            sender="agent"
            timestamp={mockTimestamp}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid UI component type gracefully', () => {
      const messageWithInvalidType: Message = {
        id: 'invalid_test',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Invalid type test',
          richContent: {
            type: 'invalid-component-type' as any,
            data: {}
          }
        },
        timestamp: mockTimestamp
      };

      // Should render without throwing errors
      expect(() => {
        render(
          <MessageBubble
            message={messageWithInvalidType}
            sender="agent"
            timestamp={mockTimestamp}
          />
        );
      }).not.toThrow();
    });
  });
});