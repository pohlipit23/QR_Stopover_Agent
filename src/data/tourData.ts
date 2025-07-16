import type { TourOption, RecommendedTour } from '../types';

// Tour data including "Whale Sharks of Qatar" with recommendation logic using provided tour images
export const availableTours: TourOption[] = [
  {
    id: 'whale-sharks-qatar',
    name: 'Whale Sharks of Qatar',
    description: 'Experience the magnificent whale sharks in Qatar\'s pristine waters. This unforgettable marine adventure includes snorkeling equipment, professional guides, and refreshments.',
    duration: '6 hours',
    price: 195,
    image: '/src/assets/images/whale sharks of qatar.jpg',
    highlights: [
      'Swimming with whale sharks',
      'Professional marine biologist guide',
      'All snorkeling equipment included',
      'Boat transportation',
      'Light refreshments and lunch',
      'Underwater photography assistance',
      'Marine conservation education',
      'Small group experience (max 12 people)'
    ],
    maxParticipants: 12
  },
  {
    id: 'pearl-diving-experience',
    name: 'Traditional Pearl Diving Experience',
    description: 'Discover Qatar\'s pearl diving heritage with this authentic cultural experience including traditional dhow boat ride and pearl diving demonstration.',
    duration: '4 hours',
    price: 145,
    image: '/src/assets/images/the pearl.jpg',
    highlights: [
      'Traditional dhow boat experience',
      'Pearl diving demonstration',
      'Cultural storytelling',
      'Traditional refreshments',
      'Pearl diving equipment trial',
      'Historical site visits',
      'Professional cultural guide',
      'Souvenir pearl gift'
    ],
    maxParticipants: 16
  },
  {
    id: 'doha-city-skyline-tour',
    name: 'Doha City & Skyline Tour',
    description: 'Comprehensive city tour showcasing Doha\'s modern architecture, cultural landmarks, and stunning skyline views from multiple vantage points.',
    duration: '5 hours',
    price: 125,
    image: '/src/assets/images/plane over skyline.jpg',
    highlights: [
      'Modern Doha skyline views',
      'Cultural district exploration',
      'Museum of Islamic Art visit',
      'Corniche waterfront walk',
      'Traditional market visit',
      'Photography opportunities',
      'Air-conditioned transportation',
      'Professional tour guide'
    ],
    maxParticipants: 20
  },
  {
    id: 'desert-safari-adventure',
    name: 'Desert Safari Adventure',
    description: 'Thrilling desert adventure including dune bashing, camel riding, and traditional Bedouin camp experience with authentic cuisine.',
    duration: '7 hours',
    price: 175,
    image: '/src/assets/images/Stopover.jpg',
    highlights: [
      'Dune bashing in 4WD vehicles',
      'Camel riding experience',
      'Sandboarding activities',
      'Traditional Bedouin camp',
      'Authentic Arabic dinner',
      'Cultural performances',
      'Sunset photography',
      'Traditional henna painting'
    ],
    maxParticipants: 24
  }
];

// Whale Sharks tour as recommended tour with special properties
export const whaleSharksTour: RecommendedTour = {
  ...availableTours[0], // Whale Sharks of Qatar tour
  isRecommended: true,
  recommendationReason: 'Perfect for your stopover dates - whale shark season is at its peak!',
  availabilityStatus: 'available',
  matchScore: 95 // High match score for recommendation
};

// Helper function to get tour by ID
export const getTourById = (id: string): TourOption | undefined => {
  return availableTours.find(tour => tour.id === id);
};

// Helper function to get tours by price range
export const getToursByPriceRange = (minPrice: number, maxPrice: number): TourOption[] => {
  return availableTours.filter(tour => 
    tour.price >= minPrice && tour.price <= maxPrice
  );
};

// Helper function to get tours sorted by price
export const getToursSortedByPrice = (ascending: boolean = true): TourOption[] => {
  return [...availableTours].sort((a, b) => 
    ascending ? a.price - b.price : b.price - a.price
  );
};

// Helper function to get recommended tour based on dates and preferences
export const getRecommendedTour = (stopoverDates?: Date[]): RecommendedTour => {
  // For this mockup, always recommend the Whale Sharks tour
  // In a real implementation, this would check seasonal availability, weather, etc.
  return whaleSharksTour;
};

// Helper function to calculate tour recommendation score
export const calculateTourMatchScore = (tour: TourOption, preferences?: any): number => {
  // Simplified scoring logic for mockup
  // Whale Sharks tour gets highest score
  if (tour.id === 'whale-sharks-qatar') {
    return 95;
  }
  
  // Other tours get varying scores based on popularity/season
  const scoreMap: { [key: string]: number } = {
    'pearl-diving-experience': 85,
    'doha-city-skyline-tour': 75,
    'desert-safari-adventure': 80
  };
  
  return scoreMap[tour.id] || 70;
};