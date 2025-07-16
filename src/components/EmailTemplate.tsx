import React, { useState } from 'react';
import type { CustomerData, BookingData } from '../types';
import ChatContainer from './ChatContainer';

interface EmailTemplateProps {
  customer: CustomerData;
  booking: BookingData;
  onBuildStopover?: () => void;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({ 
  customer, 
  booking, 
  onBuildStopover 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleBuildStopover = () => {
    setIsChatOpen(true);
    onBuildStopover?.();
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white font-jotia">
      {/* Email Header */}
      <div className="bg-primary-burgundy text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <img
            src="/src/assets/images/Qatar-Airways-Logo.png"
            alt="Qatar Airways"
            className="h-8 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="text-right">
            <div className="text-sm opacity-90">Privilege Club</div>
            <div className="font-semibold">{customer.privilegeClubNumber}</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-burgundy mb-2">
            Turn Your Layover Into An Adventure
          </h1>
          <p className="text-lg text-neutral-grey2">
            Discover Doha with our complimentary stopover program
          </p>
        </div>
        <img
          src="/src/assets/images/Qatar-Airways-stopover-program-1200x553.jpeg"
          alt="Discover Doha with Qatar Airways Stopover"
          className="w-full h-64 object-cover rounded-2xl shadow-md"
        />
      </div>

      {/* Personalized Content */}
      <div className="px-8 pb-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-burgundy mb-4">
            Dear {customer.name},
          </h2>
          <p className="text-neutral-grey2 text-lg leading-relaxed mb-6">
            We noticed you have a connecting flight through Doha on your upcoming journey from 
            <span className="font-semibold"> {booking.route.origin}</span> to 
            <span className="font-semibold"> {booking.route.destination}</span> 
            (Booking Reference: <span className="font-semibold">{booking.pnr}</span>).
          </p>
          <p className="text-neutral-grey2 text-lg leading-relaxed">
            Why not extend your stay and explore the vibrant city of Doha? Our stopover program 
            offers you the perfect opportunity to experience Qatar's rich culture, world-class 
            dining, and stunning architecture – all at exceptional value.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-neutral-light-grey rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-neutral-grey2 mb-4">
            What's Included in Your Stopover
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-burgundy rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-neutral-grey2">Premium Hotels</div>
                <div className="text-sm text-neutral-grey1">4 & 5-star accommodations</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-burgundy rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-neutral-grey2">City Tours</div>
                <div className="text-sm text-neutral-grey1">Guided experiences included</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-burgundy rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-neutral-grey2">Airport Transfers</div>
                <div className="text-sm text-neutral-grey1">Complimentary transportation</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-burgundy rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-neutral-grey2">Flexible Duration</div>
                <div className="text-sm text-neutral-grey1">1-4 nights available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-neutral-grey2 mb-6">
            Experience the Best of Doha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <img
                src="/src/assets/images/souq_waqif_hotel.webp"
                alt="Souq Waqif"
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold text-neutral-grey2 mb-1">Souq Waqif</h4>
              <p className="text-sm text-neutral-grey1">Traditional marketplace & dining</p>
            </div>
            <div className="text-center">
              <img
                src="/src/assets/images/the pearl.jpg"
                alt="The Pearl Qatar"
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold text-neutral-grey2 mb-1">The Pearl</h4>
              <p className="text-sm text-neutral-grey1">Luxury shopping & waterfront</p>
            </div>
            <div className="text-center">
              <img
                src="/src/assets/images/whale sharks of qatar.jpg"
                alt="Marine Adventures"
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold text-neutral-grey2 mb-1">Marine Life</h4>
              <p className="text-sm text-neutral-grey1">Whale shark encounters</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary-burgundy to-secondary-oneworld-blue rounded-2xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Explore Doha?
          </h3>
          <p className="text-lg opacity-90 mb-6">
            Build your perfect stopover experience in just a few clicks
          </p>
          <button
            onClick={handleBuildStopover}
            className="bg-white text-primary-burgundy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-neutral-light transition-colors inline-flex items-center space-x-2"
          >
            <span>Build My Stopover</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Additional Information */}
        <div className="border-t border-neutral-light-grey pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-neutral-grey2 mb-2">Booking Details</h4>
              <div className="space-y-1 text-neutral-grey1">
                <div>PNR: {booking.pnr}</div>
                <div>Route: {booking.route.routing}</div>
                <div>Passengers: {booking.passengers} Adults</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-grey2 mb-2">Need Assistance?</h4>
              <div className="space-y-1 text-neutral-grey1">
                <div>Call: +974 4023 0000</div>
                <div>Email: stopover@qatarairways.com</div>
                <div>Available 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-neutral-light-grey px-8 py-6 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <img
            src="/src/assets/images/Qatar-Airways-Logo.png"
            alt="Qatar Airways"
            className="h-6 w-auto"
          />
          <img
            src="/src/assets/images/privilege_club_logo.png"
            alt="Privilege Club"
            className="h-6 w-auto"
          />
        </div>
        <p className="text-xs text-neutral-grey1 mb-2">
          This email was sent to {customer.email} for Privilege Club member {customer.privilegeClubNumber}
        </p>
        <p className="text-xs text-neutral-grey1">
          Qatar Airways | P.O. Box 22550 | Doha, Qatar
        </p>
        <div className="mt-4 space-x-4 text-xs">
          <a href="#" className="text-primary-burgundy hover:underline">Unsubscribe</a>
          <a href="#" className="text-primary-burgundy hover:underline">Privacy Policy</a>
          <a href="#" className="text-primary-burgundy hover:underline">Terms & Conditions</a>
        </div>
      </div>

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatContainer
          entryPoint="email"
          isModal={true}
          customer={customer}
          booking={booking}
          onClose={handleChatClose}
          onConversationUpdate={(state) => {
            console.log('Email conversation updated:', state);
          }}
        />
      )}
    </div>
  );
};

export default EmailTemplate;