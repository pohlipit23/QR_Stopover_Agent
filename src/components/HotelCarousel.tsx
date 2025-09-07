import React from 'react';
import type { HotelOption } from '../types';

interface HotelCarouselProps {
  hotels: HotelOption[];
  onHotelSelect: (hotel: HotelOption) => void;
  selectedHotelId?: string;
}

interface HotelCardProps {
  hotel: HotelOption;
  onSelect: (hotel: HotelOption) => void;
  isSelected: boolean;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400' : 'text-neutral-grey1'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect, isSelected }) => {
  const handleSelect = () => {
    onSelect(hotel);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case '5-star deluxe':
        return 'bg-primary-burgundy text-white';
      case '5-star':
        return 'bg-secondary-oneworld text-white';
      case '4-star':
        return 'bg-neutral-grey2 text-white';
      default:
        return 'bg-neutral-grey1 text-white';
    }
  };

  return (
    <div
      className={`
        flex-shrink-0 w-80 bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer
        hover:shadow-md hover:-translate-y-1
        ${isSelected 
          ? 'border-primary-burgundy shadow-md' 
          : 'border-neutral-lightGrey hover:border-primary-burgundy'
        }
      `}
      onClick={handleSelect}
    >
      {/* Hotel Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={hotel.image}
          alt={`${hotel.name} exterior`}
          className="w-full h-52 object-cover transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/src/assets/images/placeholder-hotel.jpg';
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(hotel.category)}`}>
            {hotel.category}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white bg-opacity-95 rounded-lg px-3 py-2">
            <div className="text-right">
              <div className="text-lg font-bold text-primary-burgundy font-jotia">
                ${hotel.pricePerNight}
              </div>
              <div className="text-xs text-neutral-grey1">per night</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Hotel Name and Star Rating */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-grey2 font-jotia mb-2">
            {hotel.name}
          </h3>
          <StarRating rating={hotel.starRating} />
        </div>

        {/* Key Amenities */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-neutral-grey2 mb-3">Key Amenities</h4>
          <div className="space-y-2">
            {hotel.amenities.slice(0, 4).map((amenity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-burgundy flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-neutral-grey2">{amenity}</span>
              </div>
            ))}
            {hotel.amenities.length > 4 && (
              <div className="text-xs text-neutral-grey1 mt-2 pl-6">
                +{hotel.amenities.length - 4} more amenities
              </div>
            )}
          </div>
        </div>

        {/* Select Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
          className={`
            w-full py-3 px-4 rounded-md font-medium text-sm transition-all duration-200
            ${isSelected
              ? 'bg-primary-burgundy text-white shadow-sm'
              : 'bg-white text-primary-burgundy border-2 border-primary-burgundy hover:bg-primary-burgundy hover:text-white'
            }
          `}
        >
          {isSelected ? 'Selected' : 'Select Hotel'}
        </button>
      </div>
    </div>
  );
};

const HotelCarousel: React.FC<HotelCarouselProps> = ({
  hotels,
  onHotelSelect,
  selectedHotelId
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-grey2 font-jotia mb-2">
          Select Your Hotel
        </h2>
        <p className="text-neutral-grey1 text-sm">
          Choose from our premium selection of hotels in Doha
        </p>
      </div>

      {/* Hotels Carousel */}
      <div className="relative">
        {/* Desktop: Horizontal Scroll with Navigation */}
        <div className="hidden tablet:block">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-full bg-white border border-neutral-lightGrey hover:border-primary-burgundy hover:bg-neutral-lightGrey transition-colors"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 text-neutral-grey2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-full bg-white border border-neutral-lightGrey hover:border-primary-burgundy hover:bg-neutral-lightGrey transition-colors"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 text-neutral-grey2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-neutral-grey1">
              {hotels.length} hotels available
            </div>
          </div>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onSelect={onHotelSelect}
                isSelected={selectedHotelId === hotel.id}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="tablet:hidden space-y-4">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onSelect={onHotelSelect}
              isSelected={selectedHotelId === hotel.id}
            />
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedHotelId && (
        <div className="mt-6 p-4 bg-neutral-lightGrey rounded-lg border border-neutral-grey1 border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-primary-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="text-sm font-medium text-neutral-grey2">
                  Selected: {hotels.find(h => h.id === selectedHotelId)?.name}
                </span>
                <div className="text-xs text-neutral-grey1">
                  {hotels.find(h => h.id === selectedHotelId)?.category} • ${hotels.find(h => h.id === selectedHotelId)?.pricePerNight} per night
                </div>
              </div>
            </div>
            
            {/* Hotel Category Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              hotels.find(h => h.id === selectedHotelId)?.category === '5-star deluxe' 
                ? 'bg-primary-burgundy text-white'
                : hotels.find(h => h.id === selectedHotelId)?.category === '5-star'
                ? 'bg-secondary-oneworld text-white'
                : 'bg-neutral-grey2 text-white'
            }`}>
              {hotels.find(h => h.id === selectedHotelId)?.category}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelCarousel;