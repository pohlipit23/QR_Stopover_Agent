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

// Asset-aware data functions using Cloudflare R2 storage
import { getAssetManager } from '../lib/cloudflare/asset-manager';

/**
 * Get hotel data with R2 asset URLs
 */
export function getHotelsWithAssets() {
  const assetManager = getAssetManager();
  const hotelImages = assetManager.getHotelImages();
  
  return premiumHotels.map((hotel: any) => ({
    ...hotel,
    image: hotelImages[hotel.id as keyof typeof hotelImages] || hotel.image,
  }));
}

/**
 * Get stopover categories with R2 asset URLs
 */
export function getCategoriesWithAssets() {
  const assetManager = getAssetManager();
  const categoryImages = assetManager.getCategoryImages();
  
  return stopoverCategories.map((category: any) => ({
    ...category,
    image: categoryImages[category.id as keyof typeof categoryImages] || category.image,
  }));
}

/**
 * Get tour data with R2 asset URLs
 */
export function getToursWithAssets() {
  const assetManager = getAssetManager();
  const tourImages = assetManager.getTourImages();
  
  return availableTours.map((tour: any) => ({
    ...tour,
    image: tourImages[tour.id as keyof typeof tourImages] || tour.image,
  }));
}

/**
 * Get brand logos with R2 asset URLs
 */
export function getBrandLogosWithAssets() {
  const assetManager = getAssetManager();
  return assetManager.getBrandLogos();
}

/**
 * Get all asset URLs for components
 */
export function getAllAssetUrls() {
  const assetManager = getAssetManager();
  return assetManager.getAssetUrls();
}

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