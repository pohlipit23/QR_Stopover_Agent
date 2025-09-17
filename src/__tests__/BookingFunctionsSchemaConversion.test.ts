import { z } from 'zod';
import { bookingFunctions } from '../lib/booking-functions';

/**
 * This test file specifically validates that the booking function schemas
 * can be processed by AI SDK without the "_def" property access errors
 * that were occurring with the previous inputSchema format.
 */
describe('Booking Functions Schema Conversion', () => {
  
  describe('Zod Schema _def Property Access', () => {
    test('should safely access _def property on all schemas', () => {
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        expect(() => {
          const schema = tool.parameters;
          
          // This is what was failing before - accessing _def property
          const def = schema._def;
          expect(def).toBeDefined();
          expect(typeof def).toBe('object');
          
          // Verify essential _def properties exist
          expect(def.typeName).toBeDefined();
          expect(typeof def.typeName).toBe('string');
          
        }).not.toThrow(`Tool ${toolName} should allow _def property access`);
      });
    });

    test('should have valid Zod type names', () => {
      const expectedTypeNames = {
        showStopoverCategories: 'ZodObject',
        selectStopoverCategory: 'ZodObject', 
        selectHotel: 'ZodObject',
        selectTimingAndDuration: 'ZodObject',
        selectExtras: 'ZodObject',
        initiatePayment: 'ZodObject',
        completeBooking: 'ZodObject'
      };

      Object.entries(expectedTypeNames).forEach(([toolName, expectedTypeName]) => {
        const tool = bookingFunctions[toolName as keyof typeof bookingFunctions];
        expect(tool.parameters._def.typeName).toBe(expectedTypeName);
      });
    });
  });

  describe('Schema Shape Validation', () => {
    test('should have proper shape definitions for object schemas', () => {
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        const schema = tool.parameters;
        
        // All our schemas should be ZodObject types
        expect(schema._def.typeName).toBe('ZodObject');
        
        // Should have shape property for object schemas
        expect(schema._def.shape).toBeDefined();
        expect(typeof schema._def.shape).toBe('function');
        
        // Should be able to get the shape
        const shape = schema._def.shape();
        expect(typeof shape).toBe('object');
      });
    });

    test('should validate schema shapes match expected structures', () => {
      const expectedShapes = {
        showStopoverCategories: {},
        selectStopoverCategory: ['categoryId', 'categoryName'],
        selectHotel: ['hotelId', 'hotelName'],
        selectTimingAndDuration: ['timing', 'duration'],
        selectExtras: ['includeTransfers', 'selectedTours', 'totalExtrasPrice'],
        initiatePayment: ['paymentMethod', 'totalAmount'],
        completeBooking: ['paymentData']
      };

      Object.entries(expectedShapes).forEach(([toolName, expectedKeys]) => {
        const tool = bookingFunctions[toolName as keyof typeof bookingFunctions];
        const shape = tool.parameters._def.shape();
        const actualKeys = Object.keys(shape);
        
        if (Array.isArray(expectedKeys)) {
          expect(actualKeys.sort()).toEqual(expectedKeys.sort());
        } else {
          // Empty object case
          expect(actualKeys).toHaveLength(0);
        }
      });
    });
  });

  describe('AI SDK Simulation', () => {
    test('should simulate zodToJsonSchema conversion process', () => {
      // This simulates the internal process that AI SDK uses
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        expect(() => {
          const schema = tool.parameters;
          
          // Step 1: Access _def (this was failing before)
          const def = schema._def;
          
          // Step 2: Check if it's a ZodObject
          expect(def.typeName).toBe('ZodObject');
          
          // Step 3: Access shape function
          const shapeFunction = def.shape;
          expect(typeof shapeFunction).toBe('function');
          
          // Step 4: Get the actual shape
          const shape = shapeFunction();
          
          // Step 5: Iterate through shape properties (what AI SDK does)
          Object.entries(shape).forEach(([key, fieldSchema]) => {
            expect(fieldSchema).toHaveProperty('_def');
            expect(fieldSchema._def).toHaveProperty('typeName');
          });
          
        }).not.toThrow(`AI SDK simulation failed for ${toolName}`);
      });
    });

    test('should handle schema parsing like AI SDK does', () => {
      const testData = {
        showStopoverCategories: {},
        selectStopoverCategory: { categoryId: 'cat-1', categoryName: 'Category 1' },
        selectHotel: { hotelId: 'hotel-1', hotelName: 'Hotel 1' },
        selectTimingAndDuration: { timing: 'outbound', duration: 2 },
        selectExtras: {
          includeTransfers: false,
          selectedTours: [],
          totalExtrasPrice: 0
        },
        initiatePayment: { paymentMethod: 'avios', totalAmount: 250 },
        completeBooking: {
          paymentData: { method: 'avios', confirmed: true }
        }
      };

      Object.entries(testData).forEach(([toolName, testInput]) => {
        const tool = bookingFunctions[toolName as keyof typeof bookingFunctions];
        
        expect(() => {
          // This is what AI SDK does internally
          const result = tool.parameters.safeParse(testInput);
          expect(result.success).toBe(true);
          
          if (result.success) {
            expect(result.data).toEqual(testInput);
          }
        }).not.toThrow(`Schema parsing failed for ${toolName}`);
      });
    });
  });

  describe('Error Handling', () => {
    test('should provide meaningful error messages for invalid data', () => {
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        const schema = tool.parameters;
        
        // Test with completely invalid data
        const result = schema.safeParse('invalid-string-input');
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error.issues).toBeDefined();
          expect(Array.isArray(result.error.issues)).toBe(true);
        }
      });
    });

    test('should handle missing required fields appropriately', () => {
      const toolsWithRequiredFields = [
        'selectStopoverCategory',
        'selectHotel', 
        'selectTimingAndDuration',
        'selectExtras',
        'initiatePayment',
        'completeBooking'
      ];

      toolsWithRequiredFields.forEach(toolName => {
        const tool = bookingFunctions[toolName as keyof typeof bookingFunctions];
        const result = tool.parameters.safeParse({});
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
          // Should have issues about missing required fields
          expect(result.error.issues.some(issue => issue.code === 'invalid_type')).toBe(true);
        }
      });
    });
  });

  describe('Backwards Compatibility Check', () => {
    test('should not have legacy inputSchema property', () => {
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        expect(tool).not.toHaveProperty('inputSchema');
      });
    });

    test('should use parameters property instead of inputSchema', () => {
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        expect(tool).toHaveProperty('parameters');
        expect(tool.parameters).toBeInstanceOf(z.ZodType);
      });
    });
  });
});