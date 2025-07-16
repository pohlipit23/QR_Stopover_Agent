# Qatar Airways Stopover AI Agent - Static Data Layer

This directory contains the comprehensive static data layer for the Qatar Airways Stopover AI Agent application. All data is structured according to the requirements and uses the provided image assets.

## Data Structure Overview

### Customer Data (`customerData.ts`)
- **Sample Customer**: Alex Johnson (PNR: X4HG8, Privilege Club: QR12345678)
- **Original Booking**: LHR-BKK-LHR for 2 adults
- **Privilege Club Account**: 15,000 Avios balance, Gold tier status
- **Confirmed Booking PNR**: X9FG1 (for post-payment confirmation)

### Stopover Categories (`stopoverCategories.ts`)
Four stopover categories with comprehensive pricing and amenities:

1. **Standard** - 3★ - $80/night
2. **Premium** - 4★ - $150/night  
3. **Premium Beach** - 4★ - $215/night
4. **Luxury** - 5★ - $300/night

Each category includes detailed amenities and references to provided category images.

### Hotel Data (`hotelData.ts`)
Five premium hotels with detailed information:

1. **Millennium Hotel Doha** - 5★ - $180/night
2. **Steigenberger Hotel Doha** - 5★ - $195/night
3. **Souq Waqif Boutique Hotel** - 5★ Deluxe - $220/night
4. **Crowne Plaza Doha** - 4★ - $165/night
5. **Al Najada Doha Hotel** - 4★ - $155/night

Each hotel includes comprehensive amenities lists and references to provided hotel images.

### Tour Data (`tourData.ts`)
Four tour options with the "Whale Sharks of Qatar" as the featured recommendation:

1. **Whale Sharks of Qatar** - 6 hours - $195/person (RECOMMENDED)
2. **Traditional Pearl Diving Experience** - 4 hours - $145/person
3. **Doha City & Skyline Tour** - 5 hours - $125/person
4. **Desert Safari Adventure** - 7 hours - $175/person

The Whale Sharks tour includes special recommendation logic with a 95% match score.

### Transfer Data (`transferData.ts`)
- **Airport Transfers (Return)** - $60 total
- Includes meet & greet service and luggage assistance
- Pricing calculation utilities for different passenger counts

### Pricing Data (`pricingData.ts`)
Comprehensive pricing calculations including:
- **Flight Fare Difference**: $115 (fixed)
- **Avios Conversion Rate**: 125 Avios per $1
- Pricing breakdown utilities
- Sample pricing scenarios for testing

## Sample Journey Data (`sampleJourney.ts`)

Complete sample user journey demonstrating:
- **Timing**: Outbound (LHR to BKK)
- **Duration**: 2 nights
- **Category**: Premium
- **Hotel**: Millennium Hotel Doha
- **Extras**: Airport transfers + Whale Sharks tour for 2 people
- **Total Cost**: Calculated dynamically

Alternative journey scenarios included for testing different user paths.

## Data Validation (`dataValidation.ts`)

Comprehensive validation utilities ensuring:
- Customer data integrity
- Booking data consistency
- Category and hotel data validation
- Tour and transfer option validation
- Pricing calculation accuracy
- Image path verification

## Image Asset References

All data structures reference the provided images:

### Hotel Images (5)
- `millenium_hotel.webp`
- `steigenberger_hotel.webp`
- `souq_waqif_hotel.webp`
- `crowne_plaza_hotel.webp`
- `al_najada_hotel.webp`

### Category Images (4)
- `standard_stopover.jpg`
- `premium_stopover.jpg`
- `premium_beach_stopover.jpg`
- `luxury_stopover.jpg`

### Tour Images (4)
- `whale sharks of qatar.jpg`
- `the pearl.jpg`
- `plane over skyline.jpg`
- `Stopover.jpg`

### Brand Images (2)
- `Qatar-Airways-Logo.png`
- `privilege_club_logo.png`

## Usage

```typescript
import {
  sampleCustomer,
  sampleBooking,
  stopoverCategories,
  premiumHotels,
  whaleSharksTour,
  calculatePricingBreakdown
} from '../data';

// Access sample customer data
console.log(sampleCustomer.name); // "Alex Johnson"

// Get recommended tour
const recommendedTour = whaleSharksTour;
console.log(recommendedTour.isRecommended); // true

// Calculate pricing
const pricing = calculatePricingBreakdown(selection, nights);
```

## Requirements Coverage

This data layer satisfies all requirements:

- **13.1**: Consistent customer data (Alex Johnson, QR12345678)
- **13.2**: Booking details (PNR X4HG8, LHR-BKK-LHR, 2 adults)
- **13.3**: Four stopover categories with accurate pricing
- **13.4**: Five premium hotels with accurate descriptions
- **13.5**: Tours including "Whale Sharks of Qatar" ($195) and transfers ($60)

All data maintains consistency throughout the application flow and references the provided image assets appropriately.