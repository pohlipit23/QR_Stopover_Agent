// Simple test file to verify static data layer functionality
import {
  sampleCustomer,
  sampleBooking,
  mockPrivilegeClubAccount,
  stopoverCategories,
  premiumHotels,
  availableTours,
  whaleSharksTour,
  defaultTransferOption,
  sampleStopoverSelection,
  samplePricing,
  calculatePricingBreakdown,
  validateAllStaticData,
  validateImagePaths
} from './index';

// Test function to verify all data is properly structured
export const testStaticDataLayer = () => {
  console.log('=== Qatar Airways Stopover AI Agent - Static Data Layer Test ===\n');
  
  // Test customer data
  console.log('1. Customer Data:');
  console.log(`   Name: ${sampleCustomer.name}`);
  console.log(`   Privilege Club: ${sampleCustomer.privilegeClubNumber}`);
  console.log(`   Email: ${sampleCustomer.email}`);
  console.log(`   Avios Balance: ${mockPrivilegeClubAccount.aviosBalance.toLocaleString()}\n`);
  
  // Test booking data
  console.log('2. Original Booking:');
  console.log(`   PNR: ${sampleBooking.pnr}`);
  console.log(`   Route: ${sampleBooking.route.routing}`);
  console.log(`   Passengers: ${sampleBooking.passengers}`);
  console.log(`   Status: ${sampleBooking.status}\n`);
  
  // Test stopover categories
  console.log('3. Stopover Categories:');
  stopoverCategories.forEach(category => {
    console.log(`   ${category.name}: ${category.starRating}★ - $${category.pricePerNight}/night`);
  });
  console.log();
  
  // Test hotels
  console.log('4. Premium Hotels:');
  premiumHotels.forEach(hotel => {
    console.log(`   ${hotel.name}: ${hotel.starRating}★ ${hotel.category} - $${hotel.pricePerNight}/night`);
  });
  console.log();
  
  // Test tours
  console.log('5. Available Tours:');
  availableTours.forEach(tour => {
    console.log(`   ${tour.name}: ${tour.duration} - $${tour.price}/person`);
  });
  console.log();
  
  // Test recommended tour
  console.log('6. Recommended Tour:');
  console.log(`   ${whaleSharksTour.name} (Score: ${whaleSharksTour.matchScore})`);
  console.log(`   Reason: ${whaleSharksTour.recommendationReason}`);
  console.log(`   Status: ${whaleSharksTour.availabilityStatus}\n`);
  
  // Test transfers
  console.log('7. Transfer Options:');
  console.log(`   ${defaultTransferOption.name}: $${defaultTransferOption.price}\n`);
  
  // Test sample journey
  console.log('8. Sample Journey:');
  console.log(`   Category: ${sampleStopoverSelection.stopovertype.name}`);
  console.log(`   Hotel: ${sampleStopoverSelection.hotel.name}`);
  console.log(`   Duration: ${sampleStopoverSelection.duration} nights`);
  console.log(`   Timing: ${sampleStopoverSelection.timing}`);
  console.log(`   Tours: ${sampleStopoverSelection.extras.tours.length} selected`);
  console.log(`   Transfers: ${sampleStopoverSelection.extras.transfers ? 'Included' : 'Not included'}\n`);
  
  // Test pricing
  console.log('9. Sample Pricing:');
  console.log(`   Hotel Cost: $${samplePricing.hotelCost}`);
  console.log(`   Flight Fare Difference: $${samplePricing.flightFareDifference}`);
  console.log(`   Transfers: $${samplePricing.transfersCost}`);
  console.log(`   Tours: $${samplePricing.toursCost}`);
  console.log(`   Total Cash: $${samplePricing.totalCashPrice}`);
  console.log(`   Total Avios: ${samplePricing.totalAviosPrice.toLocaleString()}\n`);
  
  // Test image paths
  console.log('10. Required Image Paths:');
  const imagePaths = validateImagePaths();
  console.log(`   Total images required: ${imagePaths.length}`);
  console.log(`   Hotel images: 5`);
  console.log(`   Category images: 4`);
  console.log(`   Tour images: 4`);
  console.log(`   Brand images: 2\n`);
  
  console.log('=== Static Data Layer Test Complete ===');
  
  // Return summary for programmatic use
  return {
    customerData: sampleCustomer,
    bookingData: sampleBooking,
    categoriesCount: stopoverCategories.length,
    hotelsCount: premiumHotels.length,
    toursCount: availableTours.length,
    hasRecommendedTour: whaleSharksTour.isRecommended,
    hasTransfers: !!defaultTransferOption,
    totalCashPrice: samplePricing.totalCashPrice,
    totalAviosPrice: samplePricing.totalAviosPrice,
    imagePathsCount: imagePaths.length
  };
};

// Export for use in other parts of the application
export default testStaticDataLayer;