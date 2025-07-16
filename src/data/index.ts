// Main data layer exports - comprehensive sample data for Qatar Airways Stopover AI Agent

// Customer and booking data
export {
  sampleCustomer,
  sampleBooking,
  stopoverFlightRoute,
  mockPrivilegeClubAccount,
  confirmedBookingPNR
} from './customerData';

// Stopover categories data
export {
  stopoverCategories,
  getCategoryById,
  getCategoriesByPriceRange
} from './stopoverCategories';

// Hotel data
export {
  premiumHotels,
  getHotelById,
  getHotelsByCategory,
  getHotelsByPriceRange,
  getHotelsSortedByPrice
} from './hotelData';

// Tour data with recommendation logic
export {
  availableTours,
  whaleSharksTour,
  getTourById,
  getToursByPriceRange,
  getToursSortedByPrice,
  getRecommendedTour,
  calculateTourMatchScore
} from './tourData';

// Transfer options and pricing
export {
  transferOptions,
  defaultTransferOption,
  calculateTransferCost,
  getTransferById,
  formatTransferPrice,
  sampleTransferBooking,
  type TransferPricingOptions,
  type TransferBookingDetails
} from './transferData';

// Pricing calculations and utilities
export {
  PRICING_CONSTANTS,
  calculatePricingBreakdown,
  calculateExtrasPrice,
  formatPrice,
  calculateAviosRequired,
  calculateCashFromAvios,
  samplePricingScenarios,
  getPricingDisplayData
} from './pricingData';

// Sample journey data
export {
  sampleStopoverSelection,
  samplePricing,
  sampleBookingState,
  alternativeJourneys,
  getJourneySummary
} from './sampleJourney';

// Data validation utilities
export {
  validateCustomerData,
  validateBookingData,
  validateStopoverCategory,
  validateHotelOption,
  validateTourOption,
  validateTransferOption,
  validatePricingBreakdown,
  validateAllStaticData,
  validateImagePaths
} from './dataValidation';

// Re-export types for convenience
export type {
  CustomerData,
  BookingData,
  FlightRoute,
  StopoverCategory,
  HotelOption,
  TourOption,
  RecommendedTour,
  TransferOption,
  SelectedExtras,
  SelectedTour,
  StopoverSelection,
  PrivilegeClubAccount,
  PricingBreakdown,
  BookingState
} from '../types';