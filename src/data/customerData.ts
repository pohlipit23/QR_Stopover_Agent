import type { CustomerData, BookingData, FlightRoute, PrivilegeClubAccount } from '../types';

// Sample customer data as specified in requirements
export const sampleCustomer: CustomerData = {
  name: 'Alex Johnson',
  privilegeClubNumber: 'QR12345678',
  email: 'alex.johnson@email.com'
};

// Sample booking data with PNR X4HG8 and LHR-BKK routing
export const sampleBooking: BookingData = {
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

// Updated flight route with stopover
export const stopoverFlightRoute: FlightRoute = {
  origin: 'LHR',
  destination: 'BKK',
  stops: ['DOH'],
  routing: 'LHR → DOH (stay) → BKK → DOH → LHR'
};

// Mock Privilege Club account data with 15,000 Avios balance
export const mockPrivilegeClubAccount: PrivilegeClubAccount = {
  memberId: 'QR12345678',
  memberName: 'Alex Johnson',
  tierStatus: 'Gold',
  aviosBalance: 275000,
  isLoggedIn: false
};

// New PNR for confirmed booking
export const confirmedBookingPNR = 'X9FG1';