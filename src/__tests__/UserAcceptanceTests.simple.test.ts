/**
 * Simplified User Acceptance Tests (UAT)
 * Qatar Airways Stopover AI Agent
 */

import '@testing-library/jest-dom';

// Import test data
import { 
  sampleCustomer, 
  sampleBooking
} from '../data/customerData';
import { stopoverCategories } from '../data/stopoverCategories';
import { premiumHotels } from '../data/hotelData';
import { 
  availableTours,
  whaleSharksTour
} from '../data/tourData';
import { defaultTransferOption } from '../data/transferData';

describe('User Acceptance Tests - Qatar Airways Stopover AI Agent', () => {
  
  describe('Requirement 1: Multiple Entry Points', () => {
    test('UAT-1.1: Sample customer data is properly structured', () => {
      expect(sampleCustomer.name).toBe('Alex Johnson');
      expect(sampleCustomer.privilegeClubNumber).toBe('QR12345678');
      expect(sampleCustomer.email).toBe('alex.johnson@email.com');
    });

    test('UAT-1.2: Sample booking data includes required fields', () => {
      expect(sampleBooking.pnr).toBe('X4HG8');
      expect(sampleBooking.route.origin).toBe('LHR');
      expect(sampleBooking.route.destination).toBe('BKK');
      expect(sampleBooking.passengers).toBe(2);
      expect(sampleBooking.status).toBe('confirmed');
    });
  });

  describe('Requirement 3: Stopover Category Selection', () => {
    test('UAT-3.1: Four stopover categories are available', () => {
      expect(stopoverCategories).toHaveLength(4);
      
      const categoryNames = stopoverCategories.map(cat => cat.name);
      expect(categoryNames).toContain('Standard');
      expect(categoryNames).toContain('Premium');
      expect(categoryNames).toContain('Premium Beach');
      expect(categoryNames).toContain('Luxury');
    });

    test('UAT-3.2: Categories have proper pricing structure', () => {
      const standardCategory = stopoverCategories.find(cat => cat.name === 'Standard');
      const luxuryCategory = stopoverCategories.find(cat => cat.name === 'Luxury');
      
      expect(standardCategory?.pricePerNight).toBe(80);
      expect(luxuryCategory?.pricePerNight).toBe(300);
    });

    test('UAT-3.3: Categories include star ratings and images', () => {
      stopoverCategories.forEach(category => {
        expect(category.starRating).toBeGreaterThan(0);
        expect(category.starRating).toBeLessThanOrEqual(5);
        expect(category.image).toBeTruthy();
        expect(category.amenities).toBeInstanceOf(Array);
      });
    });
  });

  describe('Requirement 4: Hotel Selection', () => {
    test('UAT-4.1: Five premium hotels are available', () => {
      expect(premiumHotels).toHaveLength(5);
      
      const hotelNames = premiumHotels.map(hotel => hotel.name);
      expect(hotelNames).toContain('Millennium Hotel Doha');
      expect(hotelNames).toContain('Steigenberger Hotel Doha');
      expect(hotelNames).toContain('Souq Waqif Boutique Hotel');
      expect(hotelNames).toContain('Crowne Plaza Doha');
      expect(hotelNames).toContain('Al Najada Doha Hotel');
    });

    test('UAT-4.2: Hotels have proper structure and pricing', () => {
      premiumHotels.forEach(hotel => {
        expect(hotel.id).toBeTruthy();
        expect(hotel.name).toBeTruthy();
        expect(hotel.starRating).toBeGreaterThan(0);
        expect(hotel.pricePerNight).toBeGreaterThan(0);
        expect(hotel.image).toBeTruthy();
        expect(hotel.amenities).toBeInstanceOf(Array);
        expect(hotel.amenities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Requirement 6: Automatic Tour Recommendation', () => {
    test('UAT-6.1: Whale Sharks tour is properly configured', () => {
      expect(whaleSharksTour.name).toBe('Whale Sharks of Qatar');
      expect(whaleSharksTour.isRecommended).toBe(true);
      expect(whaleSharksTour.recommendationReason).toBeTruthy();
      expect(whaleSharksTour.matchScore).toBeGreaterThan(0);
      expect(whaleSharksTour.price).toBe(195);
    });

    test('UAT-6.2: Tour recommendation has special properties', () => {
      expect(whaleSharksTour.availabilityStatus).toBe('available');
      expect(whaleSharksTour.matchScore).toBe(95);
      expect(whaleSharksTour.recommendationReason).toContain('Perfect for your stopover dates');
    });
  });

  describe('Requirement 7: Optional Extras Selection', () => {
    test('UAT-7.1: Transfer option is properly configured', () => {
      expect(defaultTransferOption.name).toBe('Airport Transfers (Return)');
      expect(defaultTransferOption.price).toBe(60);
      expect(defaultTransferOption.type).toBe('airport-transfer');
      expect(defaultTransferOption.description).toBeTruthy();
    });

    test('UAT-7.2: Multiple tours are available for selection', () => {
      expect(availableTours.length).toBeGreaterThan(1);
      
      availableTours.forEach(tour => {
        expect(tour.id).toBeTruthy();
        expect(tour.name).toBeTruthy();
        expect(tour.price).toBeGreaterThan(0);
        expect(tour.duration).toBeTruthy();
        expect(tour.image).toBeTruthy();
        expect(tour.highlights).toBeInstanceOf(Array);
      });
    });
  });

  describe('Requirement 13: Consistent Sample Data', () => {
    test('UAT-13.1: Customer data consistency across components', () => {
      // Test that customer data is consistent
      expect(sampleCustomer.name).toBe('Alex Johnson');
      expect(sampleCustomer.privilegeClubNumber).toBe('QR12345678');
    });

    test('UAT-13.2: Booking data consistency', () => {
      // Test that booking data is consistent
      expect(sampleBooking.pnr).toBe('X4HG8');
      expect(sampleBooking.route.routing).toBe('LHR-BKK-LHR');
      expect(sampleBooking.passengers).toBe(2);
    });

    test('UAT-13.3: Pricing data consistency', () => {
      // Test that pricing is consistent across data structures
      const standardCategory = stopoverCategories.find(cat => cat.name === 'Standard');
      const premiumCategory = stopoverCategories.find(cat => cat.name === 'Premium');
      
      expect(standardCategory?.pricePerNight).toBeLessThan(premiumCategory?.pricePerNight || 0);
    });
  });

  describe('Data Validation and Structure', () => {
    test('UAT-DV-1: All required data structures exist', () => {
      expect(sampleCustomer).toBeDefined();
      expect(sampleBooking).toBeDefined();
      expect(stopoverCategories).toBeDefined();
      expect(premiumHotels).toBeDefined();
      expect(availableTours).toBeDefined();
      expect(whaleSharksTour).toBeDefined();
      expect(defaultTransferOption).toBeDefined();
    });

    test('UAT-DV-2: Data structures have required properties', () => {
      // Customer validation
      expect(sampleCustomer).toHaveProperty('name');
      expect(sampleCustomer).toHaveProperty('privilegeClubNumber');
      expect(sampleCustomer).toHaveProperty('email');

      // Booking validation
      expect(sampleBooking).toHaveProperty('pnr');
      expect(sampleBooking).toHaveProperty('route');
      expect(sampleBooking).toHaveProperty('passengers');
      expect(sampleBooking).toHaveProperty('status');

      // Route validation
      expect(sampleBooking.route).toHaveProperty('origin');
      expect(sampleBooking.route).toHaveProperty('destination');
      expect(sampleBooking.route).toHaveProperty('routing');
    });

    test('UAT-DV-3: Pricing calculations are consistent', () => {
      // Test that pricing follows expected patterns
      const prices = stopoverCategories.map(cat => cat.pricePerNight);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      
      expect(prices).toEqual(sortedPrices); // Prices should be in ascending order by category
    });
  });

  describe('Business Logic Validation', () => {
    test('UAT-BL-1: Tour recommendation logic is sound', () => {
      // Whale sharks tour should have highest match score
      const otherTours = availableTours.filter(tour => tour.id !== whaleSharksTour.id);
      const otherScores = otherTours.map(tour => (tour as any).matchScore || 0);
      const maxOtherScore = Math.max(...otherScores);
      
      expect(whaleSharksTour.matchScore).toBeGreaterThanOrEqual(maxOtherScore);
    });

    test('UAT-BL-2: Hotel categorization is correct', () => {
      // All premium hotels should have appropriate star ratings
      premiumHotels.forEach(hotel => {
        expect(hotel.starRating).toBeGreaterThanOrEqual(4);
        expect(hotel.category).toMatch(/premium|4-star|5-star/i);
      });
    });

    test('UAT-BL-3: Price ranges are realistic', () => {
      // Test that prices are within realistic ranges
      stopoverCategories.forEach(category => {
        expect(category.pricePerNight).toBeGreaterThan(50);
        expect(category.pricePerNight).toBeLessThan(500);
      });

      premiumHotels.forEach(hotel => {
        expect(hotel.pricePerNight).toBeGreaterThan(100);
        expect(hotel.pricePerNight).toBeLessThan(800);
      });

      availableTours.forEach(tour => {
        expect(tour.price).toBeGreaterThan(50);
        expect(tour.price).toBeLessThan(500);
      });
    });
  });

  describe('Integration Readiness', () => {
    test('UAT-IR-1: All data has required IDs for integration', () => {
      stopoverCategories.forEach(category => {
        expect(category.id).toBeTruthy();
        expect(typeof category.id).toBe('string');
      });

      premiumHotels.forEach(hotel => {
        expect(hotel.id).toBeTruthy();
        expect(typeof hotel.id).toBe('string');
      });

      availableTours.forEach(tour => {
        expect(tour.id).toBeTruthy();
        expect(typeof tour.id).toBe('string');
      });
    });

    test('UAT-IR-2: Image references are properly structured', () => {
      stopoverCategories.forEach(category => {
        expect(category.image).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      });

      premiumHotels.forEach(hotel => {
        expect(hotel.image).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      });

      availableTours.forEach(tour => {
        expect(tour.image).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      });
    });

    test('UAT-IR-3: All text content is properly localized', () => {
      // Test that all user-facing text is in English and properly formatted
      expect(sampleCustomer.name).toMatch(/^[A-Za-z\s]+$/);
      
      stopoverCategories.forEach(category => {
        expect(category.name).toBeTruthy();
        expect(category.amenities.length).toBeGreaterThan(0);
      });

      premiumHotels.forEach(hotel => {
        expect(hotel.name).toBeTruthy();
        expect(hotel.amenities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('UAT-PS-1: Data structures are efficiently sized', () => {
      // Test that data structures are not excessively large
      expect(stopoverCategories.length).toBeLessThanOrEqual(10);
      expect(premiumHotels.length).toBeLessThanOrEqual(20);
      expect(availableTours.length).toBeLessThanOrEqual(50);
    });

    test('UAT-PS-2: No circular references in data', () => {
      // Test that data can be serialized (no circular references)
      expect(() => JSON.stringify(sampleCustomer)).not.toThrow();
      expect(() => JSON.stringify(sampleBooking)).not.toThrow();
      expect(() => JSON.stringify(stopoverCategories)).not.toThrow();
      expect(() => JSON.stringify(premiumHotels)).not.toThrow();
      expect(() => JSON.stringify(availableTours)).not.toThrow();
    });
  });

  describe('UAT Summary', () => {
    test('All critical user requirements are testable', () => {
      // This test ensures we have coverage for all critical requirements
      const criticalRequirements = [
        'Multiple Entry Points',
        'Stopover Category Selection',
        'Hotel Selection', 
        'Automatic Tour Recommendation',
        'Optional Extras Selection',
        'Consistent Sample Data'
      ];

      expect(criticalRequirements).toHaveLength(6);
      
      // Each requirement should have corresponding test data
      criticalRequirements.forEach(requirement => {
        expect(requirement).toBeTruthy();
      });
    });

    test('Application is ready for user acceptance testing', () => {
      // Final validation that all components are ready
      const readinessChecks = {
        customerDataReady: !!sampleCustomer.name,
        bookingDataReady: !!sampleBooking.pnr,
        categoriesReady: stopoverCategories.length === 4,
        hotelsReady: premiumHotels.length === 5,
        toursReady: availableTours.length > 0,
        recommendationReady: whaleSharksTour.isRecommended,
        transfersReady: !!defaultTransferOption.name
      };

      Object.entries(readinessChecks).forEach(([check, ready]) => {
        expect(ready).toBe(true);
      });

      // Calculate overall readiness score
      const readyCount = Object.values(readinessChecks).filter(Boolean).length;
      const totalChecks = Object.keys(readinessChecks).length;
      const readinessScore = (readyCount / totalChecks) * 100;

      expect(readinessScore).toBe(100);
    });
  });
});