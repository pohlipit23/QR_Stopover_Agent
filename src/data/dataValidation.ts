import type { 
  CustomerData, 
  BookingData, 
  StopoverCategory, 
  HotelOption, 
  TourOption, 
  TransferOption,
  PricingBreakdown 
} from '../types';

// Data validation utilities to ensure consistency across the static data layer

export const validateCustomerData = (customer: CustomerData): boolean => {
  return !!(
    customer.name &&
    customer.privilegeClubNumber &&
    customer.privilegeClubNumber.startsWith('QR') &&
    customer.privilegeClubNumber.length === 10
  );
};

export const validateBookingData = (booking: BookingData): boolean => {
  return !!(
    booking.pnr &&
    booking.pnr.length === 5 &&
    booking.route &&
    booking.route.origin &&
    booking.route.destination &&
    booking.passengers > 0 &&
    ['confirmed', 'pending', 'cancelled'].includes(booking.status)
  );
};

export const validateStopoverCategory = (category: StopoverCategory): boolean => {
  return !!(
    category.id &&
    category.name &&
    ['standard', 'premium', 'premium beach', 'luxury'].includes(category.category) &&
    category.starRating >= 1 && category.starRating <= 5 &&
    category.pricePerNight > 0 &&
    category.image &&
    Array.isArray(category.amenities)
  );
};

export const validateHotelOption = (hotel: HotelOption): boolean => {
  return !!(
    hotel.id &&
    hotel.name &&
    ['4-star', '5-star', '5-star deluxe'].includes(hotel.category) &&
    hotel.starRating >= 1 && hotel.starRating <= 5 &&
    hotel.pricePerNight > 0 &&
    hotel.image &&
    Array.isArray(hotel.amenities)
  );
};

export const validateTourOption = (tour: TourOption): boolean => {
  return !!(
    tour.id &&
    tour.name &&
    tour.description &&
    tour.duration &&
    tour.price > 0 &&
    tour.image &&
    Array.isArray(tour.highlights) &&
    tour.maxParticipants > 0
  );
};

export const validateTransferOption = (transfer: TransferOption): boolean => {
  return !!(
    transfer.id &&
    transfer.name &&
    transfer.description &&
    transfer.price > 0 &&
    transfer.type === 'airport-transfer'
  );
};

export const validatePricingBreakdown = (pricing: PricingBreakdown): boolean => {
  const expectedTotal = pricing.hotelCost + 
                       pricing.flightFareDifference + 
                       pricing.transfersCost + 
                       pricing.toursCost;
  
  return !!(
    pricing.hotelCost >= 0 &&
    pricing.flightFareDifference >= 0 &&
    pricing.transfersCost >= 0 &&
    pricing.toursCost >= 0 &&
    Math.abs(pricing.totalCashPrice - expectedTotal) < 0.01 && // Allow for floating point precision
    pricing.totalAviosPrice > 0
  );
};

// Comprehensive data validation function
export const validateAllStaticData = () => {
  const errors: string[] = [];
  
  // Import and validate all data
  import('./index').then(async (dataModule) => {
    // Validate customer data
    if (!validateCustomerData(dataModule.sampleCustomer)) {
      errors.push('Invalid sample customer data');
    }
    
    // Validate booking data
    if (!validateBookingData(dataModule.sampleBooking)) {
      errors.push('Invalid sample booking data');
    }
    
    // Validate stopover categories
    dataModule.stopoverCategories.forEach((category, index) => {
      if (!validateStopoverCategory(category)) {
        errors.push(`Invalid stopover category at index ${index}: ${category.name}`);
      }
    });
    
    // Validate hotels
    dataModule.premiumHotels.forEach((hotel, index) => {
      if (!validateHotelOption(hotel)) {
        errors.push(`Invalid hotel at index ${index}: ${hotel.name}`);
      }
    });
    
    // Validate tours
    dataModule.availableTours.forEach((tour, index) => {
      if (!validateTourOption(tour)) {
        errors.push(`Invalid tour at index ${index}: ${tour.name}`);
      }
    });
    
    // Validate transfers
    dataModule.transferOptions.forEach((transfer, index) => {
      if (!validateTransferOption(transfer)) {
        errors.push(`Invalid transfer option at index ${index}: ${transfer.name}`);
      }
    });
    
    if (errors.length > 0) {
      console.error('Data validation errors:', errors);
      return false;
    }
    
    console.log('All static data validation passed successfully');
    return true;
  });
};

// Image path validation
export const validateImagePaths = () => {
  const requiredImages = [
    // Hotel images
    '/src/assets/images/millenium_hotel.webp',
    '/src/assets/images/steigenberger_hotel.webp',
    '/src/assets/images/souq_waqif_hotel.webp',
    '/src/assets/images/crowne_plaza_hotel.webp',
    '/src/assets/images/al_najada_hotel.webp',
    
    // Category images
    '/src/assets/images/standard_stopover.jpg',
    '/src/assets/images/premium_stopover.jpg',
    '/src/assets/images/premium_beach_stopover.jpg',
    '/src/assets/images/luxury_stopover.jpg',
    
    // Tour images
    '/src/assets/images/whale sharks of qatar.jpg',
    '/src/assets/images/the pearl.jpg',
    '/src/assets/images/plane over skyline.jpg',
    '/src/assets/images/Stopover.jpg',
    
    // Brand images
    '/src/assets/images/Qatar-Airways-Logo.png',
    '/src/assets/images/privilege_club_logo.png'
  ];
  
  console.log('Required image paths for data layer:', requiredImages);
  return requiredImages;
};