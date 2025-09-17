import { bookingFunctions } from '../lib/booking-functions';

/**
 * Integration tests to verify booking functions work in scenarios
 * similar to how they would be used by the AI SDK
 */
describe('Booking Functions Integration Tests', () => {
  
  describe('Tool Registration Simulation', () => {
    test('should be registerable as AI SDK tools', () => {
      // Simulate how AI SDK would register these tools
      const registeredTools: Record<string, any> = {};
      
      expect(() => {
        Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
          // Simulate AI SDK tool registration process
          registeredTools[toolName] = {
            description: tool.description,
            parameters: tool.parameters,
            execute: tool.execute
          };
          
          // Verify the tool can be processed
          expect(registeredTools[toolName].parameters._def).toBeDefined();
        });
      }).not.toThrow();
      
      expect(Object.keys(registeredTools)).toHaveLength(7);
    });
  });

  describe('End-to-End Tool Flow', () => {
    test('should execute complete booking flow without errors', async () => {
      const results: any[] = [];
      
      // Step 1: Show categories
      const categoriesResult = await bookingFunctions.showStopoverCategories.execute({});
      results.push(categoriesResult);
      expect(categoriesResult.success).toBe(true);
      expect(categoriesResult.categories).toBeDefined();
      
      // Step 2: Select category
      const categoryResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      results.push(categoryResult);
      expect(categoryResult.success).toBe(true);
      expect(categoryResult.hotels).toBeDefined();
      
      // Step 3: Select hotel
      const hotelResult = await bookingFunctions.selectHotel.execute({
        hotelId: 'hotel-1',
        hotelName: 'Test Hotel'
      });
      results.push(hotelResult);
      expect(hotelResult.success).toBe(true);
      
      // Step 4: Select timing and duration
      const timingResult = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound',
        duration: 2
      });
      results.push(timingResult);
      expect(timingResult.success).toBe(true);
      
      // Step 5: Select extras
      const extrasResult = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [
          {
            tourId: 'tour-1',
            tourName: 'City Tour',
            quantity: 2,
            totalPrice: 100
          }
        ],
        totalExtrasPrice: 160 // 100 for tours + 60 for transfers
      });
      results.push(extrasResult);
      expect(extrasResult.success).toBe(true);
      expect(extrasResult.pricing).toBeDefined();
      
      // Step 6: Initiate payment
      const paymentResult = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: extrasResult.pricing.totalCashPrice
      });
      results.push(paymentResult);
      expect(paymentResult.success).toBe(true);
      
      // Step 7: Complete booking
      const completionResult = await bookingFunctions.completeBooking.execute({
        paymentData: {
          method: 'credit-card',
          confirmed: true
        }
      });
      results.push(completionResult);
      expect(completionResult.success).toBe(true);
      expect(completionResult.newPNR).toBeDefined();
      
      // Verify all steps completed successfully
      expect(results).toHaveLength(7);
      expect(results.every(result => result.success)).toBe(true);
    });
  });

  describe('Parameter Validation Integration', () => {
    test('should validate parameters correctly in realistic scenarios', () => {
      const testCases = [
        {
          tool: 'selectStopoverCategory',
          validParams: { categoryId: 'premium', categoryName: 'Premium Experience' },
          invalidParams: { categoryId: 123, categoryName: null }
        },
        {
          tool: 'selectTimingAndDuration',
          validParams: { timing: 'return', duration: 3 },
          invalidParams: { timing: 'invalid', duration: 0 }
        },
        {
          tool: 'initiatePayment',
          validParams: { paymentMethod: 'avios', totalAmount: 500 },
          invalidParams: { paymentMethod: 'bitcoin', totalAmount: -100 }
        }
      ];

      testCases.forEach(({ tool, validParams, invalidParams }) => {
        const toolFunction = bookingFunctions[tool as keyof typeof bookingFunctions];
        
        // Valid parameters should pass
        expect(() => {
          const result = toolFunction.parameters.parse(validParams);
          expect(result).toEqual(validParams);
        }).not.toThrow();
        
        // Invalid parameters should fail
        expect(() => {
          toolFunction.parameters.parse(invalidParams);
        }).toThrow();
      });
    });
  });

  describe('UI Component Generation', () => {
    test('should generate appropriate UI components for each step', async () => {
      const uiComponents: any[] = [];
      
      // Test that each tool generates expected UI components
      const testExecutions = [
        {
          tool: bookingFunctions.showStopoverCategories,
          params: {},
          expectedUIType: 'stopover-categories'
        },
        {
          tool: bookingFunctions.selectStopoverCategory,
          params: { categoryId: 'premium', categoryName: 'Premium' },
          expectedUIType: 'hotels'
        },
        {
          tool: bookingFunctions.selectHotel,
          params: { hotelId: 'hotel-1', hotelName: 'Test Hotel' },
          expectedUIType: 'stopover-options'
        },
        {
          tool: bookingFunctions.selectTimingAndDuration,
          params: { timing: 'outbound', duration: 2 },
          expectedUIType: 'stopover-extras'
        }
      ];

      for (const { tool, params, expectedUIType } of testExecutions) {
        const result = await tool.execute(params);
        expect(result.uiComponent).toBeDefined();
        expect(result.uiComponent.type).toBe(expectedUIType);
        uiComponents.push(result.uiComponent);
      }
      
      expect(uiComponents).toHaveLength(4);
    });
  });

  describe('Error Resilience', () => {
    test('should handle malformed parameters gracefully', async () => {
      const toolsWithRequiredFields = Object.entries(bookingFunctions).filter(
        ([toolName]) => toolName !== 'showStopoverCategories'
      );
      
      for (const [toolName, tool] of toolsWithRequiredFields) {
        // Test with various malformed inputs
        const malformedInputs = [
          null,
          undefined,
          'string instead of object',
          123,
          [],
          { completely: 'wrong', structure: true }
        ];
        
        for (const malformedInput of malformedInputs) {
          // Schema validation should catch these
          const parseResult = tool.parameters.safeParse(malformedInput);
          expect(parseResult.success).toBe(false);
          
          if (!parseResult.success) {
            expect(parseResult.error).toBeDefined();
            expect(parseResult.error.issues).toBeDefined();
          }
        }
      }
    });

    test('should handle empty schema correctly', () => {
      const emptySchemaResult = bookingFunctions.showStopoverCategories.parameters.safeParse({});
      expect(emptySchemaResult.success).toBe(true);
      
      // But should still reject non-objects
      const invalidResults = [
        bookingFunctions.showStopoverCategories.parameters.safeParse(null),
        bookingFunctions.showStopoverCategories.parameters.safeParse('string'),
        bookingFunctions.showStopoverCategories.parameters.safeParse(123)
      ];
      
      invalidResults.forEach(result => {
        expect(result.success).toBe(false);
      });
    });
  });
});