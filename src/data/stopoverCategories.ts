import type { StopoverCategory } from '../types';

// Stopover category data with star ratings and comprehensive pricing structure
export const stopoverCategories: StopoverCategory[] = [
  {
    id: 'standard',
    name: 'Standard',
    category: 'standard',
    starRating: 3,
    pricePerNight: 80,
    image: '/src/assets/images/standard_stopover.jpg',
    amenities: [
      'Comfortable accommodation',
      'Room only',
      'WiFi access',
      'City center location'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    category: 'premium',
    starRating: 4,
    pricePerNight: 150,
    image: '/src/assets/images/premium_stopover.jpg',
    amenities: [
      'Luxury accommodation',
      'Full breakfast buffet',
      'High-speed WiFi',
      'Fitness center access',
      'Business center',
      'Concierge service'
    ]
  },
  {
    id: 'premium-beach',
    name: 'Premium Beach',
    category: 'premium beach',
    starRating: 5,
    pricePerNight: 215,
    image: '/src/assets/images/premium_beach_stopover.jpg',
    amenities: [
      'Beachclub access',
      'Full breakfast buffet',
      'Private beach access',
      'Water sports equipment',
      'Spa services',
      'Pool and beach bar',
      'High-speed WiFi',
      'Concierge service'
    ]
  },
  {
    id: 'luxury',
    name: 'Luxury',
    category: 'luxury',
    starRating: 5,
    pricePerNight: 300,
    image: '/src/assets/images/luxury_stopover.jpg',
    amenities: [
      'Ultra-luxury accommodation',
      'Gourmet breakfast and dining',
      'Exclusive spa access',
      'Private pool access',
      'Premium WiFi',
      '24/7 concierge',
      'VIP lounge access'
    ]
  }
];

// Helper function to get category by ID
export const getCategoryById = (id: string): StopoverCategory | undefined => {
  return stopoverCategories.find(category => category.id === id);
};

// Helper function to get categories by price range
export const getCategoriesByPriceRange = (minPrice: number, maxPrice: number): StopoverCategory[] => {
  return stopoverCategories.filter(category =>
    category.pricePerNight >= minPrice && category.pricePerNight <= maxPrice
  );
};