import React, { useState } from 'react';

interface StopoverOptionsProps {
  onTimingSelect: (timing: 'outbound' | 'return') => void;
  onDurationSelect: (nights: number) => void;
  selectedTiming?: 'outbound' | 'return';
  selectedDuration?: number;
  originalRoute?: {
    origin: string;
    destination: string;
  };
}

interface FlightTimelineProps {
  timing: 'outbound' | 'return' | null;
  duration: number;
  route: {
    origin: string;
    destination: string;
  };
}

const FlightTimeline: React.FC<FlightTimelineProps> = ({ timing, duration, route }) => {
  const renderOutboundTimeline = () => (
    <div className="flex items-center space-x-2 text-sm">
      {/* Origin */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-primary-burgundy rounded-full"></div>
        <span className="mt-1 font-medium text-neutral-grey2">{route.origin}</span>
      </div>
      
      {/* Flight Line to Doha */}
      <div className="flex-1 h-0.5 bg-primary-burgundy relative">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-grey1">
          Flight
        </div>
      </div>
      
      {/* Doha Stopover */}
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full border-2 ${timing === 'outbound' ? 'bg-secondary-oneworld border-secondary-oneworld' : 'bg-neutral-grey1 border-neutral-grey1'}`}>
          {timing === 'outbound' && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        <span className="mt-1 font-medium text-neutral-grey2">DOH</span>
        {timing === 'outbound' && (
          <span className="text-xs text-secondary-oneworld font-medium">
            {duration} night{duration > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Flight Line to Destination */}
      <div className="flex-1 h-0.5 bg-primary-burgundy relative">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-grey1">
          Flight
        </div>
      </div>
      
      {/* Destination */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-primary-burgundy rounded-full"></div>
        <span className="mt-1 font-medium text-neutral-grey2">{route.destination}</span>
      </div>
    </div>
  );

  const renderReturnTimeline = () => (
    <div className="flex items-center space-x-2 text-sm">
      {/* Origin */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-primary-burgundy rounded-full"></div>
        <span className="mt-1 font-medium text-neutral-grey2">{route.origin}</span>
      </div>
      
      {/* Flight Line to Destination */}
      <div className="flex-1 h-0.5 bg-primary-burgundy relative">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-grey1">
          Flight
        </div>
      </div>
      
      {/* Destination */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-primary-burgundy rounded-full"></div>
        <span className="mt-1 font-medium text-neutral-grey2">{route.destination}</span>
      </div>
      
      {/* Flight Line to Doha */}
      <div className="flex-1 h-0.5 bg-primary-burgundy relative">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-grey1">
          Flight
        </div>
      </div>
      
      {/* Doha Stopover */}
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full border-2 ${timing === 'return' ? 'bg-secondary-oneworld border-secondary-oneworld' : 'bg-neutral-grey1 border-neutral-grey1'}`}>
          {timing === 'return' && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        <span className="mt-1 font-medium text-neutral-grey2">DOH</span>
        {timing === 'return' && (
          <span className="text-xs text-secondary-oneworld font-medium">
            {duration} night{duration > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Flight Line back to Origin */}
      <div className="flex-1 h-0.5 bg-primary-burgundy relative">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-grey1">
          Flight
        </div>
      </div>
      
      {/* Origin (Return) */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-primary-burgundy rounded-full"></div>
        <span className="mt-1 font-medium text-neutral-grey2">{route.origin}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-lightGrey rounded-lg p-4 border border-neutral-grey1 border-opacity-20">
      <h4 className="text-sm font-medium text-neutral-grey2 mb-4">Flight Timeline</h4>
      {timing === 'outbound' ? renderOutboundTimeline() : renderReturnTimeline()}
    </div>
  );
};

const StopoverOptions: React.FC<StopoverOptionsProps> = ({
  onTimingSelect,
  onDurationSelect,
  selectedTiming,
  selectedDuration = 1,
  originalRoute = { origin: 'LHR', destination: 'BKK' }
}) => {
  const [localTiming, setLocalTiming] = useState<'outbound' | 'return' | null>(selectedTiming || null);
  const [localDuration, setLocalDuration] = useState<number>(selectedDuration);

  const handleTimingChange = (timing: 'outbound' | 'return') => {
    setLocalTiming(timing);
    onTimingSelect(timing);
  };

  const handleDurationChange = (nights: number) => {
    setLocalDuration(nights);
    onDurationSelect(nights);
  };

  const getDurationPricing = (nights: number) => {
    // Base pricing logic - this would typically come from props or context
    const basePricePerNight = 150; // This should be dynamic based on selected hotel/category
    const total = basePricePerNight * nights;
    return { perNight: basePricePerNight, total };
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-grey2 font-jotia mb-2">
          Configure Your Stopover
        </h2>
        <p className="text-neutral-grey1 text-sm">
          Choose when you'd like to stopover in Doha and for how long
        </p>
      </div>

      {/* Timing Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-grey2 font-jotia">
          Stopover Timing
        </h3>
        
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
          {/* Outbound Option */}
          <label className={`
            relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
            ${localTiming === 'outbound' 
              ? 'border-primary-burgundy bg-primary-burgundy bg-opacity-5' 
              : 'border-neutral-lightGrey hover:border-primary-burgundy hover:bg-neutral-lightGrey'
            }
          `}>
            <input
              type="radio"
              name="timing"
              value="outbound"
              checked={localTiming === 'outbound'}
              onChange={() => handleTimingChange('outbound')}
              className="sr-only"
            />
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5
              ${localTiming === 'outbound' 
                ? 'border-primary-burgundy bg-primary-burgundy' 
                : 'border-neutral-grey1'
              }
            `}>
              {localTiming === 'outbound' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-neutral-grey2 mb-1">
                Outbound Journey
              </div>
              <div className="text-sm text-neutral-grey1 mb-2">
                {originalRoute.origin} → DOH → {originalRoute.destination}
              </div>
              <div className="text-xs text-neutral-grey1">
                Stopover in Doha on your way to {originalRoute.destination}
              </div>
            </div>
          </label>

          {/* Return Option */}
          <label className={`
            relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
            ${localTiming === 'return' 
              ? 'border-primary-burgundy bg-primary-burgundy bg-opacity-5' 
              : 'border-neutral-lightGrey hover:border-primary-burgundy hover:bg-neutral-lightGrey'
            }
          `}>
            <input
              type="radio"
              name="timing"
              value="return"
              checked={localTiming === 'return'}
              onChange={() => handleTimingChange('return')}
              className="sr-only"
            />
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5
              ${localTiming === 'return' 
                ? 'border-primary-burgundy bg-primary-burgundy' 
                : 'border-neutral-grey1'
              }
            `}>
              {localTiming === 'return' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-neutral-grey2 mb-1">
                Return Journey
              </div>
              <div className="text-sm text-neutral-grey1 mb-2">
                {originalRoute.origin} → {originalRoute.destination} → DOH → {originalRoute.origin}
              </div>
              <div className="text-xs text-neutral-grey1">
                Stopover in Doha on your way back to {originalRoute.origin}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Duration Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-grey2 font-jotia">
          Stopover Duration
        </h3>
        
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((nights) => {
            const pricing = getDurationPricing(nights);
            return (
              <button
                key={nights}
                onClick={() => handleDurationChange(nights)}
                className={`
                  p-4 border-2 rounded-lg transition-all duration-200 text-center
                  ${localDuration === nights
                    ? 'border-primary-burgundy bg-primary-burgundy bg-opacity-5'
                    : 'border-neutral-lightGrey hover:border-primary-burgundy hover:bg-neutral-lightGrey'
                  }
                `}
              >
                <div className="font-semibold text-neutral-grey2 mb-1">
                  {nights} Night{nights > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-primary-burgundy font-medium">
                  ${pricing.total}
                </div>
                <div className="text-xs text-neutral-grey1">
                  ${pricing.perNight}/night
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flight Timeline Visualization */}
      {localTiming && (
        <FlightTimeline
          timing={localTiming}
          duration={localDuration}
          route={originalRoute}
        />
      )}

      {/* Selection Summary */}
      {localTiming && (
        <div className="p-4 bg-neutral-lightGrey rounded-lg border border-neutral-grey1 border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-primary-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="text-sm font-medium text-neutral-grey2">
                  {localTiming === 'outbound' ? 'Outbound' : 'Return'} stopover for {localDuration} night{localDuration > 1 ? 's' : ''}
                </span>
                <div className="text-xs text-neutral-grey1">
                  Total accommodation cost: ${getDurationPricing(localDuration).total}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-primary-burgundy font-jotia">
                ${getDurationPricing(localDuration).total}
              </div>
              <div className="text-xs text-neutral-grey1">
                ${getDurationPricing(localDuration).perNight} per night
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {!localTiming && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              Please select your preferred stopover timing to continue
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopoverOptions;