import React, { useState } from 'react';
import type { CustomerData, BookingData } from '../types';
import ChatContainer from './ChatContainer';

interface MMBPageProps {
  customer: CustomerData;
  booking: BookingData;
  onChatOpen?: () => void;
}

const MMBPage: React.FC<MMBPageProps> = ({ customer, booking, onChatOpen }) => {
  const [isChatButtonHovered, setIsChatButtonHovered] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatOpen = () => {
    setIsChatOpen(true);
    onChatOpen?.();
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Qatar Airways Logo */}
            <div className="flex-shrink-0">
              <img
                src="/src/assets/images/Qatar-Airways-Logo.png"
                alt="Qatar Airways"
                className="h-8 w-auto max-w-[150px]"
              />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-neutral-grey2 hover:text-primary-burgundy font-medium">
                My Bookings
              </a>
              <a href="#" className="text-neutral-grey2 hover:text-primary-burgundy font-medium">
                Check-in
              </a>
              <a href="#" className="text-neutral-grey2 hover:text-primary-burgundy font-medium">
                Flight Status
              </a>
              <a href="#" className="text-neutral-grey2 hover:text-primary-burgundy font-medium">
                Privilege Club
              </a>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-neutral-grey2 hover:text-primary-burgundy p-2"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-burgundy mb-2">
            Manage My Booking
          </h1>
          <p className="text-neutral-grey2">
            Welcome back, {customer.name}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-light p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Booking Info */}
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center mb-4">
                <div className="bg-primary-burgundy text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                  {booking.status.toUpperCase()}
                </div>
                <span className="text-neutral-grey2 text-sm">
                  Booking Reference: <span className="font-semibold text-neutral-black">{booking.pnr}</span>
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-neutral-grey2 mb-2">
                {booking.route.origin} → {booking.route.destination}
              </h2>
              
              <div className="flex flex-wrap gap-4 text-sm text-neutral-grey2">
                <div>
                  <span className="font-medium">Passengers:</span> {booking.passengers} Adults
                </div>
                <div>
                  <span className="font-medium">Route:</span> {booking.route.routing}
                </div>
                <div>
                  <span className="font-medium">Privilege Club:</span> {customer.privilegeClubNumber}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-white text-primary-burgundy border-2 border-primary-burgundy px-6 py-3 rounded-lg font-medium hover:bg-neutral-light transition-colors">
                Modify Booking
              </button>
              <button className="bg-primary-burgundy text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-burgundy-dark transition-colors">
                Check-in Online
              </button>
            </div>
          </div>

          {/* Flight Details */}
          <div className="mt-6 pt-6 border-t border-neutral-light">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-grey2 mb-3">Outbound Flight</h3>
                <div className="space-y-2 text-sm text-neutral-grey2">
                  <div className="flex justify-between">
                    <span>London Heathrow (LHR)</span>
                    <span>→</span>
                    <span>Bangkok (BKK)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Via Doha (DOH)</span>
                    <span className="text-neutral-grey1">1 Stop</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-grey2 mb-3">Return Flight</h3>
                <div className="space-y-2 text-sm text-neutral-grey2">
                  <div className="flex justify-between">
                    <span>Bangkok (BKK)</span>
                    <span>→</span>
                    <span>London Heathrow (LHR)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Via Doha (DOH)</span>
                    <span className="text-neutral-grey1">1 Stop</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Stopover Button */}
            <div className="mt-6 pt-4 border-t border-neutral-light">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm text-neutral-grey2">
                    <span className="font-medium">Connecting in Doha?</span> Turn your layover into an adventure
                  </p>
                </div>
                <button
                  onClick={handleChatOpen}
                  className="bg-primary-burgundy text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-burgundy-dark transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Stopover
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-neutral-light p-6">
            <h3 className="font-semibold text-neutral-grey2 mb-3">Seat Selection</h3>
            <p className="text-sm text-neutral-grey2 mb-4">Choose your preferred seats</p>
            <button className="text-primary-burgundy font-medium hover:underline">
              Select Seats →
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md border border-neutral-light p-6">
            <h3 className="font-semibold text-neutral-grey2 mb-3">Special Requests</h3>
            <p className="text-sm text-neutral-grey2 mb-4">Meals, assistance, and more</p>
            <button className="text-primary-burgundy font-medium hover:underline">
              Add Requests →
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md border border-neutral-light p-6">
            <h3 className="font-semibold text-neutral-grey2 mb-3">Travel Insurance</h3>
            <p className="text-sm text-neutral-grey2 mb-4">Protect your journey</p>
            <button className="text-primary-burgundy font-medium hover:underline">
              Add Insurance →
            </button>
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={handleChatOpen}
        onMouseEnter={() => setIsChatButtonHovered(true)}
        onMouseLeave={() => setIsChatButtonHovered(false)}
        className={`fixed bottom-6 right-6 bg-primary-burgundy text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50 ${
          isChatButtonHovered ? 'transform -translate-y-1 shadow-xl' : ''
        }`}
        aria-label="Open chat for stopover assistance"
      >
        <div className="flex items-center">
          {/* Chat Icon */}
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          
          {/* Tooltip on hover */}
          {isChatButtonHovered && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-neutral-black text-white text-sm rounded-lg whitespace-nowrap">
              Add Doha Stopover
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-black"></div>
            </div>
          )}
        </div>
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatContainer
          entryPoint="mmb"
          isModal={true}
          customer={customer}
          booking={booking}
          onClose={handleChatClose}
          onConversationUpdate={(state) => {
            console.log('Conversation updated:', state);
          }}
        />
      )}
    </div>
  );
};

export default MMBPage;