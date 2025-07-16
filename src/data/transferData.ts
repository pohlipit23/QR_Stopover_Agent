import type { TransferOption } from '../types';

// Transfer options data and pricing calculation utilities
export const transferOptions: TransferOption[] = [
  {
    id: 'airport-transfer-return',
    name: 'Airport Transfers (Return)',
    description: 'Comfortable return transfers between Hamad International Airport and your hotel. Includes meet & greet service and luggage assistance.',
    price: 60,
    type: 'airport-transfer'
  }
];

// Default transfer option (the main one offered)
export const defaultTransferOption: TransferOption = transferOptions[0];

// Pricing calculation utilities
export interface TransferPricingOptions {
  passengers: number;
  nights: number;
  includeTransfers: boolean;
}

export const calculateTransferCost = (options: TransferPricingOptions): number => {
  if (!options.includeTransfers) {
    return 0;
  }
  
  // Base price is for return transfers regardless of passenger count or nights
  // In a real system, this might vary based on passenger count or vehicle type
  return defaultTransferOption.price;
};

// Helper function to get transfer option by ID
export const getTransferById = (id: string): TransferOption | undefined => {
  return transferOptions.find(transfer => transfer.id === id);
};

// Helper function to format transfer pricing display
export const formatTransferPrice = (price: number): string => {
  return `$${price} return`;
};

// Transfer booking details for confirmation
export interface TransferBookingDetails {
  option: TransferOption;
  pickupTime: string;
  dropoffTime: string;
  vehicleType: string;
  driverContact: string;
}

// Sample transfer booking details for confirmation
export const sampleTransferBooking: TransferBookingDetails = {
  option: defaultTransferOption,
  pickupTime: 'As per flight arrival',
  dropoffTime: 'As per flight departure',
  vehicleType: 'Premium sedan',
  driverContact: 'Will be provided 24 hours before arrival'
};