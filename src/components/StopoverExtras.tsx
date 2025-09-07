import React, { useState, useEffect } from 'react';
import type { TransferOption, TourOption, RecommendedTour, SelectedTour, SelectedExtras } from '../types';

interface StopoverExtrasProps {
  transfers: TransferOption;
  tours: TourOption[];
  recommendedTour: RecommendedTour;
  onExtrasChange: (extras: SelectedExtras) => void;
  selectedExtras?: SelectedExtras;
  passengers?: number;
}

interface TransferToggleProps {
  transfer: TransferOption;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
  passengers: number;
}

interface RecommendedTourCardProps {
  tour: RecommendedTour;
  onAddTour: (tour: TourOption, quantity: number) => void;
  isAdded: boolean;
  quantity: number;
  passengers: number;
}

const TransferToggle: React.FC<TransferToggleProps> = ({ 
  transfer, 
  isSelected, 
  onToggle, 
  passengers 
}) => {
  return (
    <div className={`
      p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer
      ${isSelected 
        ? 'border-primary-burgundy bg-primary-burgundy bg-opacity-5' 
        : 'border-neutral-lightGrey hover:border-primary-burgundy hover:bg-neutral-lightGrey'
      }
    `}
    onClick={() => onToggle(!isSelected)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Toggle Switch */}
          <div className={`
            relative w-12 h-6 rounded-full transition-colors duration-200
            ${isSelected ? 'bg-primary-burgundy' : 'bg-neutral-grey1'}
          `}>
            <div className={`
              absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
              ${isSelected ? 'translate-x-7' : 'translate-x-1'}
            `} />
          </div>
          
          <div>
            <h4 className="font-medium text-neutral-grey2">{transfer.name}</h4>
            <p className="text-sm text-neutral-grey1 mt-1">{transfer.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-primary-burgundy font-jotia">
            ${transfer.price}
          </div>
          <div className="text-xs text-neutral-grey1">return</div>
        </div>
      </div>
    </div>
  );
};

const RecommendedTourCard: React.FC<RecommendedTourCardProps> = ({ 
  tour, 
  onAddTour, 
  isAdded, 
  quantity, 
  passengers 
}) => {
  const [localQuantity, setLocalQuantity] = useState(quantity);

  const handleQuantityChange = (newQuantity: number) => {
    setLocalQuantity(newQuantity);
    onAddTour(tour, newQuantity);
  };

  const handleAddTour = () => {
    if (!isAdded) {
      const defaultQuantity = Math.min(passengers, 2); // Default to 2 or passenger count
      setLocalQuantity(defaultQuantity);
      onAddTour(tour, defaultQuantity);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-secondary-oneworld to-primary-burgundy rounded-lg p-1">
      {/* Recommended Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
          ⭐ Recommended
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6">
        {/* Tour Image */}
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/src/assets/images/placeholder-tour.jpg';
            }}
          />
          
          {/* Availability Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              tour.availabilityStatus === 'available' 
                ? 'bg-green-100 text-green-800'
                : tour.availabilityStatus === 'limited'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {tour.availabilityStatus === 'available' ? '✓ Available' : 
               tour.availabilityStatus === 'limited' ? '⚠ Limited' : '✗ Unavailable'}
            </span>
          </div>
        </div>

        {/* Tour Details */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-grey2 font-jotia mb-2">
            {tour.name}
          </h3>
          <p className="text-sm text-neutral-grey1 mb-3">{tour.description}</p>
          
          {/* Recommendation Reason */}
          <div className="bg-secondary-oneworld bg-opacity-10 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-secondary-oneworld mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-secondary-oneworld font-medium">
                {tour.recommendationReason}
              </p>
            </div>
          </div>

          {/* Tour Highlights */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-grey2 mb-2">Highlights</h4>
            <div className="grid grid-cols-1 gap-1">
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

          {/* Duration and Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-neutral-grey1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-neutral-grey1">{tour.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-neutral-grey1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-neutral-grey1">Max {tour.maxParticipants}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary-burgundy font-jotia">
                ${tour.price}
              </div>
              <div className="text-xs text-neutral-grey1">per person</div>
            </div>
          </div>
        </div>

        {/* Add/Quantity Controls */}
        {!isAdded ? (
          <button
            onClick={handleAddTour}
            className="w-full bg-primary-burgundy text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-opacity-90 transition-colors"
          >
            Add to Stopover
          </button>
        ) : (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-grey2">Participants</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(Math.max(1, localQuantity - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-grey1 flex items-center justify-center hover:border-primary-burgundy transition-colors"
                >
                  <svg className="w-4 h-4 text-neutral-grey2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-lg font-medium text-neutral-grey2 min-w-[2rem] text-center">
                  {localQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(Math.min(passengers, localQuantity + 1))}
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
                <span className="text-sm text-neutral-grey2">Total for {localQuantity} participant{localQuantity > 1 ? 's' : ''}</span>
                <span className="text-lg font-bold text-primary-burgundy font-jotia">
                  ${tour.price * localQuantity}
                </span>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onAddTour(tour, 0)}
              className="w-full bg-white text-neutral-grey2 border border-neutral-grey1 py-2 px-4 rounded-md font-medium text-sm hover:bg-neutral-lightGrey transition-colors"
            >
              Remove from Stopover
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StopoverExtras: React.FC<StopoverExtrasProps> = ({
  transfers,
  tours,
  recommendedTour,
  onExtrasChange,
  selectedExtras,
  passengers = 2
}) => {
  const [includeTransfers, setIncludeTransfers] = useState(selectedExtras?.transfers !== undefined);
  const [selectedTours, setSelectedTours] = useState<SelectedTour[]>(selectedExtras?.tours || []);

  // Calculate total extras price
  const calculateTotalExtrasPrice = () => {
    let total = 0;
    
    if (includeTransfers) {
      total += transfers.price;
    }
    
    selectedTours.forEach(selectedTour => {
      total += selectedTour.totalPrice;
    });
    
    return total;
  };

  // Update parent component when extras change
  useEffect(() => {
    const extras: SelectedExtras = {
      transfers: includeTransfers ? transfers : undefined,
      tours: selectedTours,
      totalExtrasPrice: calculateTotalExtrasPrice()
    };
    onExtrasChange(extras);
  }, [includeTransfers, selectedTours, transfers, onExtrasChange]);

  const handleTransferToggle = (selected: boolean) => {
    setIncludeTransfers(selected);
  };

  const handleTourAdd = (tour: TourOption, quantity: number) => {
    if (quantity === 0) {
      // Remove tour
      setSelectedTours(prev => prev.filter(t => t.tour.id !== tour.id));
    } else {
      // Add or update tour
      const totalPrice = tour.price * quantity;
      const selectedTour: SelectedTour = {
        tour,
        quantity,
        totalPrice
      };
      
      setSelectedTours(prev => {
        const existing = prev.find(t => t.tour.id === tour.id);
        if (existing) {
          return prev.map(t => t.tour.id === tour.id ? selectedTour : t);
        } else {
          return [...prev, selectedTour];
        }
      });
    }
  };

  const isRecommendedTourAdded = selectedTours.some(t => t.tour.id === recommendedTour.id);
  const recommendedTourQuantity = selectedTours.find(t => t.tour.id === recommendedTour.id)?.quantity || 0;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-grey2 font-jotia mb-2">
          Enhance Your Stopover
        </h2>
        <p className="text-neutral-grey1 text-sm">
          Add transfers and tours to make the most of your time in Doha
        </p>
      </div>

      {/* Airport Transfers */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-grey2 font-jotia">
          Airport Transfers
        </h3>
        <TransferToggle
          transfer={transfers}
          isSelected={includeTransfers}
          onToggle={handleTransferToggle}
          passengers={passengers}
        />
      </div>

      {/* Recommended Tour */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-grey2 font-jotia">
          Recommended Experience
        </h3>
        <RecommendedTourCard
          tour={recommendedTour}
          onAddTour={handleTourAdd}
          isAdded={isRecommendedTourAdded}
          quantity={recommendedTourQuantity}
          passengers={passengers}
        />
      </div>

      {/* More Tours Link */}
      <div className="text-center">
        <button className="text-primary-burgundy font-medium text-sm hover:underline">
          Browse All Tours & Experiences
        </button>
      </div>

      {/* Running Total */}
      {(includeTransfers || selectedTours.length > 0) && (
        <div className="sticky bottom-0 bg-white border-t border-neutral-lightGrey pt-4">
          <div className="bg-neutral-lightGrey rounded-lg p-4">
            <h4 className="font-medium text-neutral-grey2 mb-3">Selected Extras</h4>
            
            <div className="space-y-2 mb-4">
              {includeTransfers && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-grey2">{transfers.name}</span>
                  <span className="font-medium text-neutral-grey2">${transfers.price}</span>
                </div>
              )}
              
              {selectedTours.map((selectedTour) => (
                <div key={selectedTour.tour.id} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-grey2">
                    {selectedTour.tour.name} × {selectedTour.quantity}
                  </span>
                  <span className="font-medium text-neutral-grey2">${selectedTour.totalPrice}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-neutral-grey1 border-opacity-20 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-grey2">Total Extras</span>
                <span className="text-xl font-bold text-primary-burgundy font-jotia">
                  ${calculateTotalExtrasPrice()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopoverExtras;