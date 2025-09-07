import React from 'react';
import type { StopoverCategory } from '../types';

interface StopoverCategoryCarouselProps {
  categories: StopoverCategory[];
  onCategorySelect: (category: StopoverCategory) => void;
  selectedCategoryId?: string;
}

interface CategoryCardProps {
  category: StopoverCategory;
  onSelect: (category: StopoverCategory) => void;
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

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect, isSelected }) => {
  const handleSelect = () => {
    onSelect(category);
  };

  return (
    <div
      className={`
        flex-shrink-0 w-72 bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer
        hover:shadow-md hover:-translate-y-1
        ${isSelected 
          ? 'border-primary-burgundy shadow-md' 
          : 'border-neutral-lightGrey hover:border-primary-burgundy'
        }
      `}
      onClick={handleSelect}
    >
      {/* Category Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={category.image}
          alt={`${category.name} stopover category`}
          className="w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/src/assets/images/placeholder-category.jpg';
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-neutral-grey2">
            {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Category Name and Star Rating */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-neutral-grey2 font-jotia">
            {category.name}
          </h3>
          <StarRating rating={category.starRating} />
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-primary-burgundy font-jotia">
              ${category.pricePerNight}
            </span>
            <span className="text-sm text-neutral-grey1">per night</span>
          </div>
        </div>

        {/* Amenities Preview */}
        <div className="mb-6">
          <div className="space-y-2">
            {category.amenities.slice(0, 3).map((amenity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-burgundy flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-neutral-grey2">{amenity}</span>
              </div>
            ))}
            {category.amenities.length > 3 && (
              <div className="text-xs text-neutral-grey1 mt-2">
                +{category.amenities.length - 3} more amenities
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
          {isSelected ? 'Selected' : 'Select Category'}
        </button>
      </div>
    </div>
  );
};

const StopoverCategoryCarousel: React.FC<StopoverCategoryCarouselProps> = ({
  categories,
  onCategorySelect,
  selectedCategoryId
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-grey2 font-jotia mb-2">
          Choose Your Stopover Category
        </h2>
        <p className="text-neutral-grey1 text-sm">
          Select the perfect accommodation level for your Doha stopover experience
        </p>
      </div>

      {/* Categories Carousel */}
      <div className="relative">
        {/* Desktop Grid Layout */}
        <div className="hidden tablet:grid tablet:grid-cols-2 desktop:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={onCategorySelect}
              isSelected={selectedCategoryId === category.id}
            />
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="tablet:hidden">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={onCategorySelect}
                isSelected={selectedCategoryId === category.id}
              />
            ))}
          </div>
          
          {/* Scroll Indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-neutral-grey1 opacity-30"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCategoryId && (
        <div className="mt-6 p-4 bg-neutral-lightGrey rounded-lg border border-neutral-grey1 border-opacity-20">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-primary-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <span className="text-sm font-medium text-neutral-grey2">
                Selected: {categories.find(c => c.id === selectedCategoryId)?.name}
              </span>
              <span className="text-xs text-neutral-grey1 ml-2">
                ${categories.find(c => c.id === selectedCategoryId)?.pricePerNight} per night
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopoverCategoryCarousel;