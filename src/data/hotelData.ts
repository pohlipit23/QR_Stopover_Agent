import type { HotelOption } from '../types';

// Five premium hotels with detailed amenities and pricing using provided hotel images
export const premiumHotels: HotelOption[] = [
  {
    id: 'millennium-doha',
    name: 'Millennium Hotel Doha',
    category: '5-star',
    starRating: 5,
    pricePerNight: 180,
    image: '/src/assets/images/millenium_hotel.webp',
    amenities: [
      'Luxury rooms with city views',
      'Multiple dining restaurants',
      'Outdoor swimming pool',
      'Fitness center and spa',
      'Business center',
      'Free WiFi throughout',
      'Airport shuttle service',
      'Concierge service',
      '24-hour room service',
      'Meeting and event facilities'
    ]
  },
  {
    id: 'steigenberger-doha',
    name: 'Steigenberger Hotel Doha',
    category: '5-star',
    starRating: 5,
    pricePerNight: 195,
    image: '/src/assets/images/steigenberger_hotel.webp',
    amenities: [
      'Elegant rooms with modern amenities',
      'Rooftop pool with panoramic views',
      'Award-winning restaurants',
      'Luxury spa and wellness center',
      'State-of-the-art fitness center',
      'Executive lounge access',
      'High-speed internet',
      'Valet parking',
      'Personal shopping service',
      'Cultural tour arrangements'
    ]
  },
  {
    id: 'souq-waqif-boutique',
    name: 'Souq Waqif Boutique Hotel',
    category: '5-star deluxe',
    starRating: 5,
    pricePerNight: 220,
    image: '/src/assets/images/souq_waqif_hotel.webp',
    amenities: [
      'Traditional Qatari architecture',
      'Boutique luxury suites',
      'Heritage courtyard dining',
      'Traditional hammam spa',
      'Cultural immersion experiences',
      'Artisan shopping access',
      'Falconry demonstrations',
      'Traditional music performances',
      'Authentic Qatari cuisine',
      'Private cultural tours'
    ]
  },
  {
    id: 'crowne-plaza-doha',
    name: 'Crowne Plaza Doha',
    category: '4-star',
    starRating: 4,
    pricePerNight: 165,
    image: '/src/assets/images/crowne_plaza_hotel.webp',
    amenities: [
      'Contemporary business hotel',
      'Executive club floors',
      'International dining options',
      'Outdoor pool and sun deck',
      'Fully equipped gym',
      'Business center facilities',
      'Free airport shuttle',
      'Complimentary WiFi',
      'Meeting rooms available',
      'Shopping mall access'
    ]
  },
  {
    id: 'al-najada-doha',
    name: 'Al Najada Doha Hotel',
    category: '4-star',
    starRating: 4,
    pricePerNight: 155,
    image: '/src/assets/images/al_najada_hotel.webp',
    amenities: [
      'Modern Arabian hospitality',
      'Spacious rooms and suites',
      'Multiple restaurants and cafes',
      'Rooftop swimming pool',
      'Health club and spa',
      'Free WiFi access',
      'Airport transfer service',
      'Laundry and dry cleaning',
      'Tour desk services',
      'Currency exchange'
    ]
  }
];

// Helper function to get hotel by ID
export const getHotelById = (id: string): HotelOption | undefined => {
  return premiumHotels.find(hotel => hotel.id === id);
};

// Helper function to get hotels by category
export const getHotelsByCategory = (category: string): HotelOption[] => {
  return premiumHotels.filter(hotel => hotel.category === category);
};

// Helper function to get hotels by price range
export const getHotelsByPriceRange = (minPrice: number, maxPrice: number): HotelOption[] => {
  return premiumHotels.filter(hotel => 
    hotel.pricePerNight >= minPrice && hotel.pricePerNight <= maxPrice
  );
};

// Helper function to get hotels sorted by price
export const getHotelsSortedByPrice = (ascending: boolean = true): HotelOption[] => {
  return [...premiumHotels].sort((a, b) => 
    ascending ? a.pricePerNight - b.pricePerNight : b.pricePerNight - a.pricePerNight
  );
};