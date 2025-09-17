import { z } from 'zod';
import { bookingFunctions } from '../lib/booking-functions';

describe('Booking Functions Tool Structure Validation', () => {
  const toolNames = [
    'showStopoverCategories',
    'selectStopoverCategory', 
    'selectHotel',
    'selectTimingAndDuration',
    'selectExtras',
    'initiatePayment',
    'completeBooking'
  ];

  describe('Tool Structure Requirements', () => {
    toolNames.forEach(toolName => {
      describe(`${toolName} tool`, () => {
        const tool = bookingFunctions[toolName as keyof typeof bookingFunctions];

        test('should have required properties (description, parameters, execute)', () => {
          expect(tool).toBeDefined();
          expect(tool).toHaveProperty('description');
          expect(tool).toHaveProperty('parameters');
          expect(tool).toHaveProperty('execute');
        });

        test('description should be a non-empty string', () => {
          expect(typeof tool.description).toBe('string');
          expect(tool.description.length).toBeGreaterThan(0);
        });

        test('parameters should be a valid Zod schema', () => {
          expect(tool.parameters).toBeDefined();
          // Check if it's a Zod schema by verifying it has the _def property
          expect(tool.parameters).toHaveProperty('_def');
          // Verify it's actually a ZodType instance
          expect(tool.parameters instanceof z.ZodType).toBe(true);
        });

        test('execute should be a function', () => {
          expect(typeof tool.execute).toBe('function');
        });
      });
    });
  });

  describe('Zod Schema Validation', () => {
    toolNames.forEach(toolName => {
      describe(`${toolName} schema`, () => {
        const tool = bookingFunctions[toolName as keyof typeof bookingFunctions];

        test('should be convertible to JSON schema without _def access errors', () => {
          expect(() => {
            // This simulates what the AI SDK does internally
            const schema = tool.parameters;
            // Access the _def property to ensure it doesn't throw
            expect(schema._def).toBeDefined();
            
            // Test that we can safely access schema properties
            expect(schema._def.typeName).toBeDefined();
          }).not.toThrow();
        });

        test('should be parseable with valid input', () => {
          const schema = tool.parameters;
          
          // Test with sample valid data for each schema
          let validInput: any = {};
          
          switch (toolName) {
            case 'showStopoverCategories':
              validInput = {};
              break;
            case 'selectStopoverCategory':
              validInput = { categoryId: 'test-id', categoryName: 'Test Category' };
              break;
            case 'selectHotel':
              validInput = { hotelId: 'hotel-1', hotelName: 'Test Hotel' };
              break;
            case 'selectTimingAndDuration':
              validInput = { timing: 'outbound', duration: 2 };
              break;
            case 'selectExtras':
              validInput = {
                includeTransfers: true,
                selectedTours: [
                  {
                    tourId: 'tour-1',
                    tourName: 'Test Tour',
                    quantity: 1,
                    totalPrice: 50
                  }
                ],
                totalExtrasPrice: 50
              };
              break;
            case 'initiatePayment':
              validInput = { paymentMethod: 'credit-card', totalAmount: 100 };
              break;
            case 'completeBooking':
              validInput = {
                paymentData: { method: 'credit-card', confirmed: true }
              };
              break;
          }
          
          expect(() => schema.parse(validInput)).not.toThrow();
          const parsed = schema.parse(validInput);
          expect(parsed).toEqual(validInput);
        });

        test('should reject invalid input with proper error', () => {
          const schema = tool.parameters;
          
          // Test with invalid data types
          const invalidInputs = [
            null,
            undefined,
            'invalid string',
            123,
            []
          ];
          
          invalidInputs.forEach(invalidInput => {
            expect(() => schema.parse(invalidInput)).toThrow();
          });
        });
      });
    });
  });

  describe('Tool Export Format', () => {
    test('bookingFunctions should be an object', () => {
      expect(typeof bookingFunctions).toBe('object');
      expect(bookingFunctions).not.toBeNull();
      expect(Array.isArray(bookingFunctions)).toBe(false);
    });

    test('should export all expected tools', () => {
      toolNames.forEach(toolName => {
        expect(bookingFunctions).toHaveProperty(toolName);
      });
    });

    test('should not have unexpected properties', () => {
      const exportedKeys = Object.keys(bookingFunctions);
      const unexpectedKeys = exportedKeys.filter(key => !toolNames.includes(key));
      expect(unexpectedKeys).toHaveLength(0);
    });
  });

  describe('AI SDK Compatibility', () => {
    test('all tools should be compatible with AI SDK tool format', () => {
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        // Verify the tool structure matches AI SDK expectations
        expect(tool).toMatchObject({
          description: expect.any(String),
          parameters: expect.any(z.ZodType),
          execute: expect.any(Function)
        });
        
        // Ensure no legacy inputSchema property exists
        expect(tool).not.toHaveProperty('inputSchema');
      });
    });

    test('should simulate AI SDK schema processing without errors', () => {
      expect(() => {
        Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
          // Simulate what AI SDK does when processing tools
          const schema = tool.parameters;
          
          // Access _def property (this was causing the original error)
          const def = schema._def;
          expect(def).toBeDefined();
          
          // Simulate JSON schema conversion process
          expect(def.typeName).toBeDefined();
          
          // Verify the schema can be used for validation
          if (toolName === 'showStopoverCategories') {
            schema.parse({});
          }
        });
      }).not.toThrow();
    });
  });

  describe('Tool Execution', () => {
    test('all tools should have async execute functions', () => {
      Object.entries(bookingFunctions).forEach(([toolName, tool]) => {
        expect(tool.execute.constructor.name).toBe('AsyncFunction');
      });
    });

    test('execute functions should return promises', async () => {
      // Test with proper parameters for each function
      const testParams = {
        showStopoverCategories: {},
        selectStopoverCategory: { categoryId: 'test-id', categoryName: 'Test Category' },
        selectHotel: { hotelId: 'hotel-1', hotelName: 'Test Hotel' },
        selectTimingAndDuration: { timing: 'outbound', duration: 2 },
        selectExtras: {
          includeTransfers: true,
          selectedTours: [
            {
              tourId: 'tour-1',
              tourName: 'Test Tour',
              quantity: 1,
              totalPrice: 50
            }
          ],
          totalExtrasPrice: 50
        },
        initiatePayment: { paymentMethod: 'credit-card', totalAmount: 100 },
        completeBooking: {
          paymentData: { method: 'credit-card', confirmed: true }
        }
      };

      for (const [toolName, tool] of Object.entries(bookingFunctions)) {
        const params = testParams[toolName as keyof typeof testParams];
        const result = tool.execute(params);
        expect(result).toBeInstanceOf(Promise);
        
        // Verify the promise resolves successfully
        const resolved = await result;
        expect(resolved).toBeDefined();
        expect(resolved.success).toBe(true);
      }
    });
  });
});