import type { 
  BookingState, 
  StopoverSelection, 
  SelectedExtras, 
  SelectedTour,
  PricingBreakdown 
} from '../types';

import {
  sampleCustomer,
  sampleBooking,
  stopoverCategories,
  premiumHotels,
  whaleSharksTour,
  defaultTransferOption,
  calculatePricingBreakdown
} from './index';

// Complete sample journey data showing a typical user flow
export const sampleStopoverSelection: StopoverSelection = {
  timing: 'outbound', // LHR to BKK
  duration: 2, // 2 nights
  stopovertype: stopoverCategories[1], // Premium category
  hotel: premiumHotels[1], // Steigenberger Hotel Doha
  extras: {
    transfers: defaultTransferOption,
    tours: [
      {
        tour: whaleSharksTour,
        quantity: 2, // For 2 passengers
        totalPrice: whaleSharksTour.price * 2
      }
    ],
    totalExtrasPrice: defaultTransferOption.price + (whaleSharksTour.price * 2)
  }
};

// Calculate pricing for the sample journey
export const samplePricing: PricingBreakdown = calculatePricingBreakdown(
  sampleStopoverSelection,
  sampleStopoverSelection.duration
);

// Complete booking state for the sample journey
export const sampleBookingState: BookingState = {
  customer: sampleCustomer,
  originalBooking: sampleBooking,
  stopoverSelection: sampleStopoverSelection,
  pricing: samplePricing,
  paymentStatus: 'pending'
};

// Alternative journey scenarios for testing different paths
export const alternativeJourneys = {
  // Luxury 3-night stay with multiple tours
  luxuryJourney: {
    timing: 'return' as const,
    duration: 3,
    stopovertype: stopoverCategories[3], // Luxury
    hotel: premiumHotels[2], // Souq Waqif Boutique Hotel
    extras: {
      transfers: defaultTransferOption,
      tours: [
        {
          tour: whaleSharksTour,
          quantity: 2,
          totalPrice: whaleSharksTour.price * 2
        }
      ],
      totalExtrasPrice: defaultTransferOption.price + (whaleSharksTour.price * 2)
    }
  },
  
  // Budget-friendly standard option
  budgetJourney: {
    timing: 'outbound' as const,
    duration: 1,
    stopovertype: stopoverCategories[0], // Standard
    hotel: premiumHotels[4], // Al Najada Doha Hotel (lowest price)
    extras: {
      transfers: defaultTransferOption,
      tours: [],
      totalExtrasPrice: defaultTransferOption.price
    }
  },
  
  // Premium beach experience
  beachJourney: {
    timing: 'outbound' as const,
    duration: 2,
    stopovertype: stopoverCategories[2], // Premium Beach
    hotel: premiumHotels[1], // Steigenberger Hotel
    extras: {
      transfers: defaultTransferOption,
      tours: [
        {
          tour: whaleSharksTour,
          quantity: 2,
          totalPrice: whaleSharksTour.price * 2
        }
      ],
      totalExtrasPrice: defaultTransferOption.price + (whaleSharksTour.price * 2)
    }
  }
};

// Journey summary for display purposes
export const getJourneySummary = (selection: StopoverSelection) => {
  const nights = selection.duration === 1 ? '1 night' : `${selection.duration} nights`;
  const timing = selection.timing === 'outbound' ? 'on your way to Bangkok' : 'on your way back to London';
  
  return {
    title: `${selection.stopovertype.name} Stopover in Doha`,
    subtitle: `${nights} ${timing}`,
    hotel: selection.hotel.name,
    category: selection.stopovertype.name,
    starRating: selection.hotel.starRating,
    hasTransfers: !!selection.extras.transfers,
    tourCount: selection.extras.tours.length,
    totalTours: selection.extras.tours.reduce((sum, tour) => sum + tour.quantity, 0)
  };
};