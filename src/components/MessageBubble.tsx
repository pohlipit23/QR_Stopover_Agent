import React from 'react';
import type { Message, RichContent, FormContent, StopoverCategory, HotelOption, SelectedExtras, SelectedTour } from '../types';
import StopoverCategoryCarousel from './StopoverCategoryCarousel';
import HotelCarousel from './HotelCarousel';
import StopoverOptions from './StopoverOptions';
import StopoverExtras from './StopoverExtras';
import ToursCarousel from './ToursCarousel';
import { 
  formatCreditCardNumber, 
  formatExpiryDate, 
  formatCVV, 
  validatePaymentForm, 
  getCardType,
  type ValidationError 
} from '../utils/form-utils';
import privilegeClubLogoSrc from '../assets/images/privilege_club_logo.png';

interface MessageBubbleProps {
  message: Message;
  sender: 'agent' | 'user';
  timestamp: Date;
  onFormSubmit?: (formData: any) => void;
  onRichContentAction?: (action: string, data: any) => void;
}

interface DeliveryStatusProps {
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
}

const DeliveryStatus: React.FC<DeliveryStatusProps> = ({ status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex text-blue-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs opacity-70">
      {getStatusIcon()}
      <span>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

const RichContentRenderer: React.FC<{
  content: RichContent;
  onAction?: (action: string, data: any) => void;
}> = ({ content, onAction }) => {
  switch (content.type) {
    case 'stopover-categories':
      return (
        <StopoverCategoryCarousel
          categories={content.data.categories || []}
          onCategorySelect={(category: StopoverCategory) => onAction?.('selectCategory', category)}
          selectedCategoryId={content.data.selectedCategoryId}
        />
      );

    case 'hotels':
      return (
        <HotelCarousel
          hotels={content.data.hotels || []}
          onHotelSelect={(hotel: HotelOption) => onAction?.('selectHotel', hotel)}
          selectedHotelId={content.data.selectedHotelId}
        />
      );

    case 'stopover-options':
      return (
        <StopoverOptions
          onTimingSelect={(timing: 'outbound' | 'return') => onAction?.('selectTiming', timing)}
          onDurationSelect={(nights: number) => onAction?.('selectDuration', nights)}
          selectedTiming={content.data.selectedTiming}
          selectedDuration={content.data.selectedDuration}
          originalRoute={content.data.originalRoute}
        />
      );

    case 'stopover-extras':
      return (
        <StopoverExtras
          transfers={content.data.transfers}
          tours={content.data.tours || []}
          recommendedTour={content.data.recommendedTour}
          onExtrasChange={(extras: SelectedExtras) => onAction?.('selectExtras', extras)}
          selectedExtras={content.data.selectedExtras}
          passengers={content.data.passengers}
        />
      );

    case 'tours':
      return (
        <ToursCarousel
          tours={content.data.tours || []}
          selectedTours={content.data.selectedTours || []}
          onToursChange={(tours: SelectedTour[]) => onAction?.('selectTours', tours)}
          maxParticipants={content.data.maxParticipants}
        />
      );

    case 'carousel':
      return (
        <div className="space-y-3">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {content.data.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                {item.price && (
                  <p className="text-lg font-semibold text-primary-burgundy mb-3">
                    ${item.price}
                  </p>
                )}
                <button
                  onClick={() => onAction?.('select', item)}
                  className="w-full bg-primary-burgundy text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'card':
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {content.data.image && (
            <img
              src={content.data.image}
              alt={content.data.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {content.data.title}
          </h3>
          <p className="text-gray-600 mb-4">{content.data.description}</p>
          {content.data.actions && (
            <div className="flex space-x-2">
              {content.data.actions.map((action: any, index: number) => (
                <button
                  key={index}
                  onClick={() => onAction?.(action.type, action.data)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    action.primary
                      ? 'bg-primary-burgundy text-white hover:bg-opacity-90'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );

    case 'summary':
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {content.data.title || 'Booking Summary'}
          </h3>
          
          {/* Flight Routing Visualization */}
          {content.data.flightRoute && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Flight Route</h4>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{content.data.flightRoute.origin}</div>
                  <div className="text-xs text-gray-500">Origin</div>
                </div>
                
                <div className="flex-1 mx-4 relative">
                  <div className="h-0.5 bg-gray-300 relative">
                    <div className="absolute inset-0 bg-primary-burgundy"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white border-2 border-primary-burgundy rounded-full p-1">
                      <svg className="w-4 h-4 text-primary-burgundy" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {content.data.flightRoute.stopover && (
                    <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-yellow-400 border-2 border-yellow-500 rounded-full w-3 h-3"></div>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
                        {content.data.flightRoute.stopover}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{content.data.flightRoute.destination}</div>
                  <div className="text-xs text-gray-500">Destination</div>
                </div>
              </div>
              
              {content.data.flightRoute.timing && (
                <div className="mt-3 text-center">
                  <span className="inline-block bg-primary-burgundy text-white px-3 py-1 rounded-full text-xs font-medium">
                    {content.data.flightRoute.timing} • {content.data.flightRoute.duration}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Booking Confirmation Special Styling */}
          {content.data.type === 'confirmation' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Booking Confirmed!</h4>
                  <p className="text-sm text-green-600">Your stopover has been successfully added</p>
                </div>
              </div>
              
              {content.data.newPNR && (
                <div className="bg-white border border-green-200 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">New PNR:</span>
                    <span className="text-lg font-bold text-primary-burgundy">{content.data.newPNR}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary Items */}
          <div className="space-y-3">
            {content.data.sections?.map((section: any, sectionIndex: number) => (
              <div key={sectionIndex} className="border-b border-gray-100 pb-3 last:border-b-0">
                {section.title && (
                  <h5 className="font-medium text-gray-800 mb-2">{section.title}</h5>
                )}
                {section.items?.map((item: any, itemIndex: number) => (
                  <div key={itemIndex} className="flex justify-between items-center py-1">
                    <span className="text-gray-600 text-sm">{item.label}</span>
                    <span className={`font-medium text-sm ${
                      item.highlight ? 'text-primary-burgundy' : 'text-gray-800'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )) || content.data.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
            
            {/* Pricing Breakdown */}
            {content.data.pricing && (
              <div className="border-t pt-3 mt-3 space-y-2">
                {content.data.pricing.breakdown?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-gray-800">{item.value}</span>
                  </div>
                ))}
                
                {content.data.pricing.total && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary-burgundy">{content.data.pricing.total}</span>
                    </div>
                    
                    {content.data.pricing.aviosEquivalent && (
                      <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                        <span>Or pay with Avios:</span>
                        <span>{content.data.pricing.aviosEquivalent}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Legacy total support */}
            {content.data.total && !content.data.pricing && (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary-burgundy">{content.data.total}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {content.data.actions && (
            <div className="mt-6 flex gap-3">
              {content.data.actions.map((action: any, index: number) => (
                <button
                  key={index}
                  onClick={() => onAction?.(action.type, action.data)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    action.primary
                      ? 'bg-primary-burgundy text-white hover:bg-opacity-90'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            Rich content type "{content.type}" not yet implemented
          </p>
        </div>
      );
  }
};

const FormRenderer: React.FC<{
  content: FormContent;
  onSubmit?: (formData: any) => void;
}> = ({ content, onSubmit }) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({
    paymentMethod: 'credit-card' // Default to credit card
  });
  const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
  const [activeTab, setActiveTab] = React.useState<'credit-card' | 'avios'>('credit-card');

  const handleInputChange = (fieldId: string, value: any) => {
    let processedValue = value;
    
    // Apply input masking for payment fields
    if (fieldId === 'cardNumber') {
      processedValue = formatCreditCardNumber(value);
    } else if (fieldId === 'expiryDate') {
      processedValue = formatExpiryDate(value);
    } else if (fieldId === 'cvv') {
      processedValue = formatCVV(value);
    }
    
    setFormData(prev => ({ ...prev, [fieldId]: processedValue, paymentMethod: activeTab }));
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== fieldId));
  };

  const handleTabChange = (tab: 'credit-card' | 'avios') => {
    setActiveTab(tab);
    setFormData(prev => ({ ...prev, paymentMethod: tab }));
    setValidationErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const errors = validatePaymentForm({ ...formData, paymentMethod: activeTab });
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    onSubmit?.({ ...formData, paymentMethod: activeTab });
  };

  const getFieldError = (fieldId: string): string | undefined => {
    return validationErrors.find(error => error.field === fieldId)?.message;
  };

  const renderPaymentTabs = () => {
    if (content.type !== 'payment') return null;
    
    return (
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => handleTabChange('credit-card')}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'credit-card'
              ? 'border-primary-burgundy text-primary-burgundy bg-red-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Credit Card
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('avios')}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'avios'
              ? 'border-primary-burgundy text-primary-burgundy bg-red-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <img src={privilegeClubLogoSrc.src} alt="Privilege Club" className="h-4 w-auto" />
          Pay with Avios
        </button>
      </div>
    );
  };

  const renderCreditCardFields = () => {
    if (activeTab !== 'credit-card') return null;
    
    const cardType = getCardType(formData.cardNumber || '');
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.cardNumber || ''}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent pr-12 ${
                getFieldError('cardNumber') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {cardType !== 'unknown' && (
              <div className="absolute right-3 top-2.5">
                <span className="text-xs font-medium text-gray-500 uppercase">{cardType}</span>
              </div>
            )}
          </div>
          {getFieldError('cardNumber') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('cardNumber')}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.expiryDate || ''}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent ${
                getFieldError('expiryDate') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="MM/YY"
              maxLength={5}
            />
            {getFieldError('expiryDate') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('expiryDate')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cvv || ''}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent ${
                getFieldError('cvv') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123"
              maxLength={4}
            />
            {getFieldError('cvv') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('cvv')}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name on Card <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nameOnCard || ''}
            onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent ${
              getFieldError('nameOnCard') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {getFieldError('nameOnCard') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('nameOnCard')}</p>
          )}
        </div>
      </div>
    );
  };

  const renderAviosFields = () => {
    if (activeTab !== 'avios') return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={privilegeClubLogoSrc.src} alt="Privilege Club" className="h-8 w-auto" />
            <div>
              <h4 className="font-medium text-gray-800">Privilege Club Login</h4>
              <p className="text-sm text-gray-600">Sign in to pay with your Avios</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent ${
              getFieldError('email') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {getFieldError('email') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent ${
              getFieldError('password') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          {getFieldError('password') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('password')}</p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Available Avios:</span>
            <span className="text-lg font-semibold text-primary-burgundy">275,000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Required for this booking:</span>
            <span className="text-sm font-medium text-gray-800">
              {content.data?.totalAviosPrice || '0'} Avios
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderRegularFields = () => {
    if (content.type === 'payment') return null;
    
    return content.fields.map((field) => (
      <div key={field.id}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'select' ? (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : field.type === 'radio' ? (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className="mr-2 text-primary-burgundy focus:ring-primary-burgundy"
                />
                {option}
              </label>
            ))}
          </div>
        ) : field.type === 'checkbox' ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData[field.id] || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="mr-2 text-primary-burgundy focus:ring-primary-burgundy"
            />
            {field.label}
          </label>
        ) : (
          <input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )}
      </div>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
      {renderPaymentTabs()}
      
      <div className="space-y-4">
        {renderCreditCardFields()}
        {renderAviosFields()}
        {renderRegularFields()}
      </div>
      
      <button
        type="submit"
        className="w-full bg-primary-burgundy text-white py-3 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors"
      >
        {content.submitLabel}
      </button>
    </form>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  timestamp,
  onFormSubmit,
  onRichContentAction
}) => {
  const isAgent = sender === 'agent';
  const isUser = sender === 'user';

  // Message bubble styling based on Qatar Airways design system
  const bubbleClasses = `
    max-w-[80%] p-4 rounded-2xl relative
    ${isAgent 
      ? 'bg-neutral-lightGrey text-neutral-grey2 rounded-bl-sm self-start' 
      : 'bg-primary-burgundy text-white rounded-br-sm self-end'
    }
    shadow-sm transition-all duration-200 hover:shadow-md
  `;

  const containerClasses = `
    flex mb-4
    ${isUser ? 'justify-end' : 'justify-start'}
  `;

  const renderMessageContent = () => {
    switch (message.content.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content.text}
            </p>
          </div>
        );

      case 'rich':
        return (
          <div className="space-y-3">
            {message.content.text && (
              <p className="text-sm leading-relaxed mb-3">
                {message.content.text}
              </p>
            )}
            <RichContentRenderer
              content={message.content.richContent!}
              onAction={onRichContentAction}
            />
          </div>
        );

      case 'form':
        return (
          <div className="space-y-3">
            {message.content.text && (
              <p className="text-sm leading-relaxed mb-3">
                {message.content.text}
              </p>
            )}
            <FormRenderer
              content={message.content.formData!}
              onSubmit={onFormSubmit}
            />
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-3">
            {message.content.text && (
              <p className="text-sm leading-relaxed mb-3">
                {message.content.text}
              </p>
            )}
            <RichContentRenderer
              content={{
                type: 'summary',
                data: message.content.richContent?.data || {}
              }}
              onAction={onRichContentAction}
            />
          </div>
        );

      default:
        return (
          <p className="text-sm leading-relaxed">
            {message.content.text || 'Unsupported message type'}
          </p>
        );
    }
  };

  const renderMetadata = () => {
    if (!message.metadata) return null;

    return (
      <div className="mt-2 text-xs opacity-70">
        {message.metadata.stepId && (
          <span className="inline-block bg-black bg-opacity-10 px-2 py-1 rounded-full mr-2">
            Step: {message.metadata.stepId}
          </span>
        )}
        {message.metadata.requiresResponse && (
          <span className="inline-block bg-yellow-500 bg-opacity-20 px-2 py-1 rounded-full">
            Response required
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        {/* Message Content */}
        {renderMessageContent()}
        
        {/* Message Metadata */}
        {renderMetadata()}
        
        {/* Timestamp and Delivery Status */}
        <div className={`flex items-center justify-between mt-3 pt-2 border-t border-opacity-20 ${
          isAgent ? 'border-gray-300' : 'border-white'
        }`}>
          <span className={`text-xs ${
            isAgent ? 'text-neutral-grey1' : 'text-white text-opacity-70'
          }`}>
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
          
          {/* Delivery Status for User Messages */}
          {isUser && (
            <DeliveryStatus 
              status="delivered" 
              timestamp={timestamp}
            />
          )}
        </div>
        
        {/* Agent Avatar for Agent Messages */}
        {isAgent && (
          <div className="absolute -left-2 -bottom-1 w-6 h-6 bg-primary-burgundy rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;