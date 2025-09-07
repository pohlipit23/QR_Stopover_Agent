import React, { useState, useEffect } from 'react';
import type { TourOption, SelectedTour } from '../types';

interface ToursCarouselProps {
  tours: TourOption[];
  selectedTours: SelectedTour[];
  onToursChange: (tours: SelectedTour[]) => void;
  maxParticipants?: number;
}

interface TourCardProps {
  tour: TourOption;
  selectedQuantity: number;
  onQuantityChange: (tourId: string, quantity: number) => void;
  maxParticipants: number;
}

interface TourBasketProps {
  selectedTours: SelectedTour[];
  onRemoveTour: (tourId: string) => void;
  onQuantityChange: (tourId: string, quantity: number) => void;
}

const TourCard: React.FC<TourCardProps> = ({ 
  tour, 
  selectedQuantity, 
  onQuantityChange, 
  maxParticipants 
}) => {
  const isSelected = selectedQuantity > 0;

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(tour.id, Math.max(0, Math.min(maxParticipants, newQuantity)));
  };

  const handleAddTour = () => {
    if (!isSelected) {
      handleQuantityChange(Math.min(2, maxParticipants)); // Default to 2 participants
    }
  };

  return (
    <div className={`
      flex-shrink-0 w-80 bg-white rounded-lg border-2 transition-all duration-200
      ${isSelected 
        ? 'border-primary-burgundy shadow-md' 
        : 'border-neutral-lightGrey hover:border-primary-burgundy hover:shadow-sm'
      }
    `}>
      {/* Tour Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/src/assets/images/placeholder-tour.jpg';
          }}
        />
        
        {/* Duration Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-neutral-grey2">
            {tour.duration}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white bg-opacity-95 rounded-lg px-3 py-2">
            <div className="text-right">
              <div className="text-lg font-bold text-primary-burgundy font-jotia">
                ${tour.price}
              </div>
              <div className="text-xs text-neutral-grey1">per person</div>
            </div>
          </div>
        </div>

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-primary-burgundy text-white px-3 py-1 rounded-full text-xs font-medium">
              ✓ Added ({selectedQuantity})
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Tour Name and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-grey2 font-jotia mb-2">
            {tour.name}
          </h3>
          <p className="text-sm text-neutral-grey1 line-clamp-2">{tour.description}</p>
        </div>

        {/* Tour Highlights */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-grey2 mb-2">Highlights</h4>
          <div className="space-y-1">
            {tour.highlights.slice(0, 3).map((highlight, index) => (
              <div key={index} className="flex items-center space-x-2">
                <svg className="w-3 h-3 text-primary-burgundy flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-neutral-grey2">{highlight}</span>
              </div>
            ))}
            {tour.highlights.length > 3 && (
              <div className="text-xs text-neutral-grey1 pl-5">
                +{tour.highlights.length - 3} more highlights
              </div>
            )}
          </div>
        </div>

        {/* Tour Details */}
        <div className="flex items-center justify-between mb-4 text-sm text-neutral-grey1">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Max {tour.maxParticipants}</span>
          </div>
        </div>

        {/* Add/Quantity Controls */}
        {!isSelected ? (
          <button
            onClick={handleAddTour}
            className="w-full bg-white text-primary-burgundy border-2 border-primary-burgundy py-3 px-4 rounded-md font-medium text-sm hover:bg-primary-burgundy hover:text-white transition-colors"
          >
            Add to Basket
          </button>
        ) : (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-grey2">Participants</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(selectedQuantity - 1)}
                  className="w-8 h-8 rounded-full border border-neutral-grey1 flex items-center justify-center hover:border-primary-burgundy transition-colors"
                >
                  <svg className="w-4 h-4 text-neutral-grey2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-lg font-medium text-neutral-grey2 min-w-[2rem] text-center">
                  {selectedQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(selectedQuantity + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-grey1 flex items-center justify-center hover:border-primary-burgundy transition-colors"
                >
                  <svg className="w-4 h-4 text-neutral-grey2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Total Price */}
            <div className="bg-neutral-lightGrey rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-grey2">Total</span>
                <span className="text-lg font-bold text-primary-burgundy font-jotia">
                  ${tour.price * selectedQuantity}
                </span>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleQuantityChange(0)}
              className="w-full bg-white text-neutral-grey2 border border-neutral-grey1 py-2 px-4 rounded-md font-medium text-sm hover:bg-neutral-lightGrey transition-colors"
            >
              Remove from Basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TourBasket: React.FC<TourBasketProps> = ({ 
  selectedTours, 
  onRemoveTour, 
  onQuantityChange 
}) => {
  const totalPrice = selectedTours.reduce((sum, tour) => sum + tour.totalPrice, 0);
  const totalParticipants = selectedTours.reduce((sum, tour) => sum + tour.quantity, 0);

  if (selectedTours.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-lightGrey rounded-lg p-4 border border-neutral-grey1 border-opacity-20">
      <h4 className="font-medium text-neutral-grey2 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-primary-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        Tour Basket ({selectedTours.length} tour{selectedTours.length > 1 ? 's' : ''})
      </h4>
      
      <div className="space-y-3 mb-4">
        {selectedTours.map((selectedTour) => (
          <div key={selectedTour.tour.id} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-grey2">
                {selectedTour.tour.name}
              </div>
              <div className="text-xs text-neutral-grey1">
                {selectedTour.quantity} participant{selectedTour.quantity > 1 ? 's' : ''} × ${selectedTour.tour.price}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-neutral-grey2">
                ${selectedTour.totalPrice}
              </span>
              <button
                onClick={() => onRemoveTour(selectedTour.tour.id)}
                className="text-neutral-grey1 hover:text-accent-red transition-colors"
                aria-label="Remove tour"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-neutral-grey1 border-opacity-20 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-neutral-grey2">Total Tours</span>
            <div className="text-xs text-neutral-grey1">{totalParticipants} total participants</div>
          </div>
          <span className="text-xl font-bold text-primary-burgundy font-jotia">
            ${totalPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

const ToursCarousel: React.FC<ToursCarouselProps> = ({
  tours,
  selectedTours,
  onToursChange,
  maxParticipants = 4
}) => {
  const [localSelectedTours, setLocalSelectedTours] = useState<SelectedTour[]>(selectedTours);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Update parent when local state changes
  useEffect(() => {
    onToursChange(localSelectedTours);
  }, [localSelectedTours, onToursChange]);

  const handleQuantityChange = (tourId: string, quantity: number) => {
    if (quantity === 0) {
      // Remove tour
      setLocalSelectedTours(prev => prev.filter(t => t.tour.id !== tourId));
    } else {
      // Add or update tour
      const tour = tours.find(t => t.id === tourId);
      if (!tour) return;

      const totalPrice = tour.price * quantity;
      const selectedTour: SelectedTour = {
        tour,
        quantity,
        totalPrice
      };
      
      setLocalSelectedTours(prev => {
        const existing = prev.find(t => t.tour.id === tourId);
        if (existing) {
          return prev.map(t => t.tour.id === tourId ? selectedTour : t);
        } else {
          return [...prev, selectedTour];
        }
      });
    }
  };

  const handleRemoveTour = (tourId: string) => {
    handleQuantityChange(tourId, 0);
  };

  const getSelectedQuantity = (tourId: string): number => {
    return localSelectedTours.find(t => t.tour.id === tourId)?.quantity || 0;
  };

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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-grey2 font-jotia mb-2">
          Browse All Tours & Experiences
        </h2>
        <p className="text-neutral-grey1 text-sm">
          Discover the best of Doha with our curated selection of tours and experiences
        </p>
      </div>

      {/* Tours Carousel */}
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
              {tours.length} tours available
            </div>
          </div>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                selectedQuantity={getSelectedQuantity(tour.id)}
                onQuantityChange={handleQuantityChange}
                maxParticipants={maxParticipants}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="tablet:hidden space-y-4">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              selectedQuantity={getSelectedQuantity(tour.id)}
              onQuantityChange={handleQuantityChange}
              maxParticipants={maxParticipants}
            />
          ))}
        </div>
      </div>

      {/* Tour Basket */}
      <TourBasket
        selectedTours={localSelectedTours}
        onRemoveTour={handleRemoveTour}
        onQuantityChange={handleQuantityChange}
      />
    </div>
  );
};

export default ToursCarousel;