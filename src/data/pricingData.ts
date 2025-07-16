import type { PricingBreakdown, StopoverSelection, SelectedExtras } from '../types';

// Pricing calculation utilities and constants
export const PRICING_CONSTANTS = {
  FLIGHT_FARE_DIFFERENCE: 115, // Fixed flight fare difference for adding stopover
  AVIOS_CONVERSION_RATE: 125, // 125 Avios per $1
  TAX_RATE: 0.0, // No tax for simplicity in mockup
  SERVICE_FEE: 0 // No service fee for simplicity
};

// Calculate comprehensive pricing breakdown
export const calculatePricingBreakdown = (
  stopoverSelection: StopoverSelection,
  nights: number
): PricingBreakdown => {
  // Hotel cost calculation
  const hotelCost = stopoverSelection.hotel.pricePerNight * nights;
  
  // Transfers cost
  const transfersCost = stopoverSelection.extras.transfers ? 
    stopoverSelection.extras.transfers.price : 0;
  
  // Tours cost
  const toursCost = stopoverSelection.extras.tours.reduce((total, selectedTour) => {
    return total + (selectedTour.tour.price * selectedTour.quantity);
  }, 0);
  
  // Total cash price
  const totalCashPrice = PRICING_CONSTANTS.FLIGHT_FARE_DIFFERENCE + 
                        hotelCost + 
                        transfersCost + 
                        toursCost;
  
  // Total Avios price
  const totalAviosPrice = totalCashPrice * PRICING_CONSTANTS.AVIOS_CONVERSION_RATE;
  
  return {
    hotelCost,
    flightFareDifference: PRICING_CONSTANTS.FLIGHT_FARE_DIFFERENCE,
    transfersCost,
    toursCost,
    totalCashPrice,
    totalAviosPrice
  };
};

// Calculate extras pricing
export const calculateExtrasPrice = (extras: SelectedExtras): number => {
  const transfersCost = extras.transfers ? extras.transfers.price : 0;
  const toursCost = extras.tours.reduce((total, selectedTour) => {
    return total + (selectedTour.tour.price * selectedTour.quantity);
  }, 0);
  
  return transfersCost + toursCost;
};

// Format price for display
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  if (currency === 'USD') {
    return `$${price.toLocaleString()}`;
  } else if (currency === 'AVIOS') {
    return `${price.toLocaleString()} Avios`;
  }
  return price.toString();
};

// Calculate Avios required for a cash amount
export const calculateAviosRequired = (cashAmount: number): number => {
  return Math.round(cashAmount * PRICING_CONSTANTS.AVIOS_CONVERSION_RATE);
};

// Calculate cash equivalent of Avios
export const calculateCashFromAvios = (aviosAmount: number): number => {
  return Math.round((aviosAmount / PRICING_CONSTANTS.AVIOS_CONVERSION_RATE) * 100) / 100;
};

// Sample pricing scenarios for testing
export const samplePricingScenarios = {
  standardOneNight: {
    hotelCost: 80,
    flightFareDifference: 115,
    transfersCost: 60,
    toursCost: 195,
    totalCashPrice: 450,
    totalAviosPrice: 56250
  },
  premiumTwoNights: {
    hotelCost: 300,
    flightFareDifference: 115,
    transfersCost: 60,
    toursCost: 390,
    totalCashPrice: 865,
    totalAviosPrice: 108125
  },
  luxuryThreeNights: {
    hotelCost: 900,
    flightFareDifference: 115,
    transfersCost: 60,
    toursCost: 585,
    totalCashPrice: 1660,
    totalAviosPrice: 207500
  }
};

// Pricing display helpers
export const getPricingDisplayData = (pricing: PricingBreakdown) => {
  return {
    breakdown: [
      { label: 'Flight fare difference', amount: pricing.flightFareDifference },
      { label: 'Hotel accommodation', amount: pricing.hotelCost },
      { label: 'Airport transfers', amount: pricing.transfersCost },
      { label: 'Tours and experiences', amount: pricing.toursCost }
    ],
    total: {
      cash: pricing.totalCashPrice,
      avios: pricing.totalAviosPrice
    }
  };
};