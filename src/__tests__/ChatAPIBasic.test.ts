import { describe, it, expect } from '@jest/globals';
import { bookingFunctions } from '../lib/booking-functions';

describe('Chat API Basic Integration Tests', () => {
  describe('Tool Parameter Validation', () => {
    it('should validate showStopoverCategories parameters', () => {
      expect(() => {
        bookingFunctions.showStopoverCategories.parameters.parse({});
      }).not.toThrow();
    });

    it('should validate selectStopoverCategory parameters', () => {
      expect(() => {
        bookingFunctions.selectStopoverCategory.parameters.parse({
          categoryId: 'premium',
          categoryName: 'Premium'
        });
      }).not.toThrow();

      expect(() => {
        bookingFunctions.selectStopoverCategory.parameters.parse({
          categoryId: 'premium'
          // missing categoryName
        });
      }).toThrow();
    });

    it('should validate selectTimingAndDuration parameters', () => {
      expect(() => {
        bookingFunctions.selectTimingAndDuration.parameters.parse({
          timing: 'outbound',
          duration: 2
        });
      }).not.toThrow();

      expect(() => {
        bookingFunctions.selectTimingAndDuration.parameters.parse({
          timing: 'invalid',
          duration: 2
        });
      }).toThrow();

      expect(() => {
        bookingFunctions.selectTimingAndDuration.parameters.parse({
          timing: 'outbound',
          duration: 0 // below minimum
        });
      }).toThrow();

      expect(() => {
        bookingFunctions.selectTimingAndDuration.parameters.parse({
          timing: 'outbound',
          duration: 5 // above maximum
        });
      }).toThrow();
    });

    it('should validate initiatePayment parameters', () => {
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

      expect(() => {
        bookingFunctions.initiatePayment.parameters.parse({
          paymentMethod: 'invalid',
          totalAmount: 500
        });
      }).toThrow();
    });
  });

  describe('Tool Execution', () => {
    it('should execute showStopoverCategories successfully', async () => {
      const result = await bookingFunctions.showStopoverCategories.execute({});
      expect(result.success).toBe(true);
      expect(result.categories).toBeDefined();
      expect(result.uiComponent).toBeDefined();
      expect(result.uiComponent.type).toBe('stopover-categories');
    });

    it('should execute selectStopoverCategory successfully', async () => {
      const result = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      expect(result.success).toBe(true);
      expect(result.selectedCategory).toBe('premium');
      expect(result.hotels).toBeDefined();
      expect(result.uiComponent.type).toBe('hotels');
    });

    it('should execute selectTimingAndDuration successfully', async () => {
      const result = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound',
        duration: 2
      });
      expect(result.success).toBe(true);
      expect(result.selectedTiming).toBe('outbound');
      expect(result.selectedDuration).toBe(2);
      expect(result.uiComponent.type).toBe('stopover-extras');
    });

    it('should execute initiatePayment with credit card', async () => {
      const result = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: 500
      });
      expect(result.success).toBe(true);
      expect(result.paymentInitialized).toBe(true);
      expect(result.uiComponent.type).toBe('form');
      expect(result.uiComponent.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'cardNumber' }),
          expect.objectContaining({ id: 'expiryDate' }),
          expect.objectContaining({ id: 'cvv' }),
          expect.objectContaining({ id: 'nameOnCard' })
        ])
      );
    });

    it('should execute initiatePayment with Avios', async () => {
      const result = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'avios',
        totalAmount: 62500
      });
      expect(result.success).toBe(true);
      expect(result.paymentInitialized).toBe(true);
      expect(result.uiComponent.type).toBe('form');
      expect(result.uiComponent.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'privilegeClubId' }),
          expect.objectContaining({ id: 'password' })
        ])
      );
    });

    it('should execute completeBooking successfully', async () => {
      const result = await bookingFunctions.completeBooking.execute({
        paymentData: {
          method: 'credit-card',
          confirmed: true
        }
      });
      expect(result.success).toBe(true);
      expect(result.bookingComplete).toBe(true);
      expect(result.newPNR).toBeDefined();
      expect(result.uiComponent.type).toBe('summary');
    });
  });
});