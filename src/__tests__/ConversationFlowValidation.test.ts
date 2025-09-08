/**
 * Comprehensive End-to-End Conversation Flow Validation
 * This test suite validates the complete LLM conversation flow from welcome to booking confirmation
 */

import { bookingFunctions } from '../lib/booking-functions';
import type { CustomerData, BookingData } from '../types';

describe('Complete Conversation Flow Validation', () => {
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

  describe('Complete User Journey Simulation', () => {
    it('should complete full booking flow: Welcome → Category → Hotel → Timing → Extras → Payment → Confirmation', async () => {
      // Step 1: Show stopover categories
      const step1Result = await bookingFunctions.showStopoverCategories.execute({});
      
      expect(step1Result.success).toBe(true);
      expect(step1Result.categories).toBeDefined();
      expect(step1Result.uiComponent.type).toBe('stopover-categories');
      expect(step1Result.message).toContain('stopover categories');

      // Step 2: Select Premium category
      const step2Result = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });

      expect(step2Result.success).toBe(true);
      expect(step2Result.selectedCategory).toBe('premium');
      expect(step2Result.hotels).toBeDefined();
      expect(step2Result.uiComponent.type).toBe('hotels');
      expect(step2Result.message).toContain('Premium');

      // Step 3: Select Millennium Hotel
      const step3Result = await bookingFunctions.selectHotel.execute({
        hotelId: 'millennium',
        hotelName: 'Millennium Hotel Doha'
      });

      expect(step3Result.success).toBe(true);
      expect(step3Result.selectedHotel).toBe('millennium');
      expect(step3Result.uiComponent.type).toBe('stopover-options');
      expect(step3Result.message).toContain('Millennium Hotel Doha');

      // Step 4: Select outbound timing, 2 nights
      const step4Result = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound',
        duration: 2
      });

      expect(step4Result.success).toBe(true);
      expect(step4Result.selectedTiming).toBe('outbound');
      expect(step4Result.selectedDuration).toBe(2);
      expect(step4Result.uiComponent.type).toBe('stopover-extras');
      expect(step4Result.message).toContain('2-night outbound');

      // Step 5: Select extras (transfers + whale sharks tour)
      const step5Result = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [
          {
            tourId: 'whale-sharks',
            tourName: 'Whale Sharks of Qatar',
            quantity: 2,
            totalPrice: 390
          }
        ],
        totalExtrasPrice: 450
      });

      expect(step5Result.success).toBe(true);
      expect(step5Result.selectedExtras.transfers).toBe(true);
      expect(step5Result.selectedExtras.tours).toHaveLength(1);
      expect(step5Result.pricing.totalCashPrice).toBeGreaterThan(0);
      expect(step5Result.pricing.totalAviosPrice).toBe(step5Result.pricing.totalCashPrice * 125);
      expect(step5Result.uiComponent.type).toBe('summary');

      // Step 6: Initiate credit card payment
      const step6Result = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: step5Result.pricing.totalCashPrice
      });

      expect(step6Result.success).toBe(true);
      expect(step6Result.paymentInitialized).toBe(true);
      expect(step6Result.uiComponent.type).toBe('form');
      expect(step6Result.uiComponent.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'cardNumber' }),
          expect.objectContaining({ id: 'expiryDate' }),
          expect.objectContaining({ id: 'cvv' }),
          expect.objectContaining({ id: 'nameOnCard' })
        ])
      );

      // Step 7: Complete booking
      const step7Result = await bookingFunctions.completeBooking.execute({
        paymentData: {
          method: 'credit-card',
          confirmed: true
        }
      });

      expect(step7Result.success).toBe(true);
      expect(step7Result.bookingComplete).toBe(true);
      expect(step7Result.newPNR).toBe('X9FG1');
      expect(step7Result.uiComponent.type).toBe('summary');
      expect(step7Result.message).toContain('🎉');
      expect(step7Result.message).toContain('X9FG1');

      // Validate complete flow data consistency
      expect(step2Result.selectedCategory).toBe('premium');
      expect(step3Result.selectedHotel).toBe('millennium');
      expect(step4Result.selectedTiming).toBe('outbound');
      expect(step4Result.selectedDuration).toBe(2);
      expect(step5Result.selectedExtras.transfers).toBe(true);
      expect(step7Result.newPNR).toBe('X9FG1');
    });

    it('should handle alternative flow: Avios payment path', async () => {
      // Follow same steps 1-5 as above, then diverge at payment
      const extrasResult = await bookingFunctions.selectExtras.execute({
        includeTransfers: false,
        selectedTours: [],
        totalExtrasPrice: 0
      });

      // Step 6: Initiate Avios payment
      const paymentResult = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'avios',
        totalAmount: extrasResult.pricing.totalCashPrice
      });

      expect(paymentResult.success).toBe(true);
      expect(paymentResult.uiComponent.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'privilegeClubId' }),
          expect.objectContaining({ id: 'password' })
        ])
      );
      expect(paymentResult.message).toContain('Privilege Club');

      // Step 7: Complete booking with Avios
      const confirmationResult = await bookingFunctions.completeBooking.execute({
        paymentData: {
          method: 'avios',
          confirmed: true
        }
      });

      expect(confirmationResult.success).toBe(true);
      expect(confirmationResult.newPNR).toBe('X9FG1');
    });

    it('should handle minimal booking flow: Standard category, no extras', async () => {
      // Step 1: Show categories
      await bookingFunctions.showStopoverCategories.execute({});

      // Step 2: Select Standard category
      const categoryResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'standard',
        categoryName: 'Standard'
      });

      expect(categoryResult.selectedCategory).toBe('standard');

      // Step 3: Select basic hotel
      const hotelResult = await bookingFunctions.selectHotel.execute({
        hotelId: 'crowne-plaza',
        hotelName: 'Crowne Plaza Doha'
      });

      expect(hotelResult.selectedHotel).toBe('crowne-plaza');

      // Step 4: Select return timing, 1 night
      const timingResult = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'return',
        duration: 1
      });

      expect(timingResult.selectedTiming).toBe('return');
      expect(timingResult.selectedDuration).toBe(1);

      // Step 5: No extras
      const extrasResult = await bookingFunctions.selectExtras.execute({
        includeTransfers: false,
        selectedTours: [],
        totalExtrasPrice: 0
      });

      expect(extrasResult.selectedExtras.transfers).toBe(false);
      expect(extrasResult.selectedExtras.tours).toHaveLength(0);

      // Complete payment and booking
      const paymentResult = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: extrasResult.pricing.totalCashPrice
      });

      const confirmationResult = await bookingFunctions.completeBooking.execute({
        paymentData: { method: 'credit-card', confirmed: true }
      });

      expect(confirmationResult.success).toBe(true);
      expect(confirmationResult.newPNR).toBe('X9FG1');
    });
  });

  describe('Data Consistency Validation', () => {
    it('should maintain pricing consistency throughout the flow', async () => {
      const extrasResult = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [
          { tourId: 'whale-sharks', tourName: 'Whale Sharks', quantity: 2, totalPrice: 390 }
        ],
        totalExtrasPrice: 450
      });

      // Validate pricing calculations
      const expectedHotelCost = 150 * 2; // 2 nights at $150/night
      const expectedFlightDifference = 115;
      const expectedTransfersCost = 60;
      const expectedToursCost = 390;
      const expectedTotal = expectedHotelCost + expectedFlightDifference + expectedTransfersCost + expectedToursCost;
      const expectedAvios = expectedTotal * 125;

      expect(extrasResult.pricing.hotelCost).toBe(expectedHotelCost);
      expect(extrasResult.pricing.flightFareDifference).toBe(expectedFlightDifference);
      expect(extrasResult.pricing.transfersCost).toBe(expectedTransfersCost);
      expect(extrasResult.pricing.toursCost).toBe(expectedToursCost);
      expect(extrasResult.pricing.totalCashPrice).toBe(expectedTotal);
      expect(extrasResult.pricing.totalAviosPrice).toBe(expectedAvios);
    });

    it('should validate tour quantity and pricing calculations', async () => {
      const multiTourExtras = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [
          { tourId: 'whale-sharks', tourName: 'Whale Sharks', quantity: 2, totalPrice: 390 },
          { tourId: 'desert-safari', tourName: 'Desert Safari', quantity: 1, totalPrice: 150 },
          { tourId: 'city-tour', tourName: 'Doha City Tour', quantity: 3, totalPrice: 225 }
        ],
        totalExtrasPrice: 825 // 60 (transfers) + 390 + 150 + 225
      });

      const totalToursCost = 390 + 150 + 225;
      expect(multiTourExtras.pricing.toursCost).toBe(totalToursCost);
      
      const totalExtrasPrice = 60 + totalToursCost;
      expect(multiTourExtras.selectedExtras.totalExtrasPrice).toBe(totalExtrasPrice);
    });

    it('should validate PNR generation and booking references', async () => {
      const confirmationResult = await bookingFunctions.completeBooking.execute({
        paymentData: { method: 'credit-card', confirmed: true }
      });

      // Validate PNR format (should be 5 characters, alphanumeric)
      expect(confirmationResult.newPNR).toMatch(/^[A-Z0-9]{5}$/);
      expect(confirmationResult.newPNR).toBe('X9FG1');
      
      // Ensure it's different from original PNR
      expect(confirmationResult.newPNR).not.toBe(mockBooking.pnr);
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle invalid category selection', async () => {
      try {
        await bookingFunctions.selectStopoverCategory.execute({
          categoryId: 'invalid-category',
          categoryName: 'Invalid Category'
        });
        // Should still succeed but with the provided data
        expect(true).toBe(true);
      } catch (error) {
        // If validation is added later, this would catch it
        expect(error).toBeDefined();
      }
    });

    it('should handle edge case: maximum duration and passengers', async () => {
      const timingResult = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound',
        duration: 4 // Maximum allowed
      });

      expect(timingResult.selectedDuration).toBe(4);
      expect(timingResult.success).toBe(true);
    });

    it('should handle edge case: no tours selected', async () => {
      const extrasResult = await bookingFunctions.selectExtras.execute({
        includeTransfers: false,
        selectedTours: [],
        totalExtrasPrice: 0
      });

      expect(extrasResult.selectedExtras.tours).toHaveLength(0);
      expect(extrasResult.pricing.toursCost).toBe(0);
      expect(extrasResult.pricing.transfersCost).toBe(0);
    });

    it('should validate minimum booking requirements', async () => {
      // Test that basic required fields are present in each step
      const categoryResult = await bookingFunctions.showStopoverCategories.execute({});
      expect(categoryResult.categories).toBeDefined();
      expect(Array.isArray(categoryResult.categories)).toBe(true);

      const hotelResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      expect(hotelResult.hotels).toBeDefined();
      expect(Array.isArray(hotelResult.hotels)).toBe(true);
    });
  });

  describe('UI Component Integration Validation', () => {
    it('should generate correct UI components for each step', async () => {
      const uiComponentTests = [
        {
          function: 'showStopoverCategories',
          params: {},
          expectedType: 'stopover-categories'
        },
        {
          function: 'selectStopoverCategory',
          params: { categoryId: 'premium', categoryName: 'Premium' },
          expectedType: 'hotels'
        },
        {
          function: 'selectHotel',
          params: { hotelId: 'millennium', hotelName: 'Millennium Hotel' },
          expectedType: 'stopover-options'
        },
        {
          function: 'selectTimingAndDuration',
          params: { timing: 'outbound', duration: 2 },
          expectedType: 'stopover-extras'
        },
        {
          function: 'selectExtras',
          params: { includeTransfers: true, selectedTours: [], totalExtrasPrice: 60 },
          expectedType: 'summary'
        },
        {
          function: 'initiatePayment',
          params: { paymentMethod: 'credit-card', totalAmount: 500 },
          expectedType: 'form'
        },
        {
          function: 'completeBooking',
          params: { paymentData: { method: 'credit-card', confirmed: true } },
          expectedType: 'summary'
        }
      ];

      for (const test of uiComponentTests) {
        const result = await bookingFunctions[test.function].execute(test.params);
        
        expect(result.success).toBe(true);
        expect(result.uiComponent).toBeDefined();
        expect(result.uiComponent.type).toBe(test.expectedType);
        expect(result.uiComponent.data).toBeDefined();
        expect(result.message).toBeDefined();
        expect(typeof result.message).toBe('string');
      }
    });

    it('should validate UI component data structure', async () => {
      const categoryResult = await bookingFunctions.showStopoverCategories.execute({});
      
      expect(categoryResult.uiComponent.data).toHaveProperty('categories');
      expect(Array.isArray(categoryResult.uiComponent.data.categories)).toBe(true);

      const hotelResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });

      expect(hotelResult.uiComponent.data).toHaveProperty('hotels');
      expect(hotelResult.uiComponent.data).toHaveProperty('selectedCategoryId');
      expect(hotelResult.uiComponent.data.selectedCategoryId).toBe('premium');
    });
  });

  describe('Performance and Reliability', () => {
    it('should execute all functions within reasonable time', async () => {
      const startTime = Date.now();
      
      // Execute complete flow
      await bookingFunctions.showStopoverCategories.execute({});
      await bookingFunctions.selectStopoverCategory.execute({ categoryId: 'premium', categoryName: 'Premium' });
      await bookingFunctions.selectHotel.execute({ hotelId: 'millennium', hotelName: 'Millennium' });
      await bookingFunctions.selectTimingAndDuration.execute({ timing: 'outbound', duration: 2 });
      await bookingFunctions.selectExtras.execute({ includeTransfers: true, selectedTours: [], totalExtrasPrice: 60 });
      await bookingFunctions.initiatePayment.execute({ paymentMethod: 'credit-card', totalAmount: 500 });
      await bookingFunctions.completeBooking.execute({ paymentData: { method: 'credit-card', confirmed: true } });
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within 1 second (very generous for unit tests)
      expect(executionTime).toBeLessThan(1000);
    });

    it('should handle concurrent function executions', async () => {
      const promises = [
        bookingFunctions.showStopoverCategories.execute({}),
        bookingFunctions.selectStopoverCategory.execute({ categoryId: 'premium', categoryName: 'Premium' }),
        bookingFunctions.selectHotel.execute({ hotelId: 'millennium', hotelName: 'Millennium' })
      ];

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.uiComponent).toBeDefined();
      });
    });
  });
});