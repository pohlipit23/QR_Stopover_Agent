/**
 * UI Component Validation Tests
 * Tests the actual rendering of UI components triggered by LLM function calls
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBubble from '../MessageBubble';
import StopoverCategoryCarousel from '../StopoverCategoryCarousel';
import HotelCarousel from '../HotelCarousel';
import StopoverOptions from '../StopoverOptions';
import StopoverExtras from '../StopoverExtras';
import type { Message } from '../../types';

// Mock image imports
jest.mock('../../assets/images/privilege_club_logo.png', () => 'privilege-club-logo.png');

describe('UI Component Validation for LLM Function Calls', () => {
  const mockTimestamp = new Date('2024-01-01T12:00:00Z');
  const mockOnRichContentAction = jest.fn();
  const mockOnFormSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Stopover Categories UI Component', () => {
    it('should render stopover categories carousel from showStopoverCategories function', () => {
      const message: Message = {
        id: '1',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Here are our stopover categories:',
          richContent: {
            type: 'stopover-categories',
            data: {
              categories: [
                {
                  id: 'standard',
                  name: 'Standard',
                  category: 'Standard',
                  pricePerNight: 80,
                  description: 'Comfortable accommodation with essential amenities',
                  amenities: ['WiFi', 'Breakfast', 'Airport Transfer'],
                  image: '/images/standard-hotel.jpg'
                },
                {
                  id: 'premium',
                  name: 'Premium',
                  category: 'Premium',
                  pricePerNight: 150,
                  description: 'Luxury accommodation with premium amenities',
                  amenities: ['WiFi', 'Breakfast', 'Airport Transfer', 'Spa Access', 'Pool'],
                  image: '/images/premium-hotel.jpg'
                }
              ]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Verify category carousel is rendered
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('$80/night')).toBeInTheDocument();
      expect(screen.getByText('$150/night')).toBeInTheDocument();
      expect(screen.getByText('Comfortable accommodation with essential amenities')).toBeInTheDocument();
      expect(screen.getByText('Luxury accommodation with premium amenities')).toBeInTheDocument();

      // Verify amenities are displayed
      expect(screen.getAllByText('WiFi')).toHaveLength(2);
      expect(screen.getAllByText('Breakfast')).toHaveLength(2);
      expect(screen.getByText('Spa Access')).toBeInTheDocument();
      expect(screen.getByText('Pool')).toBeInTheDocument();
    });

    it('should handle category selection interaction', async () => {
      const message: Message = {
        id: '1',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Select your preferred category:',
          richContent: {
            type: 'stopover-categories',
            data: {
              categories: [
                {
                  id: 'premium',
                  name: 'Premium',
                  category: 'Premium',
                  pricePerNight: 150,
                  description: 'Luxury accommodation',
                  amenities: ['WiFi', 'Spa Access'],
                  image: '/images/premium.jpg'
                }
              ]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Click on the premium category
      const selectButton = screen.getByText('Select Premium');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockOnRichContentAction).toHaveBeenCalledWith('selectCategory', {
          id: 'premium',
          name: 'Premium',
          category: 'Premium',
          pricePerNight: 150
        });
      });
    });
  });

  describe('Hotels UI Component', () => {
    it('should render hotel carousel from selectStopoverCategory function', () => {
      const message: Message = {
        id: '2',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Choose your hotel:',
          richContent: {
            type: 'hotels',
            data: {
              hotels: [
                {
                  id: 'millennium',
                  name: 'Millennium Hotel Doha',
                  category: 'Premium',
                  pricePerNight: 150,
                  rating: 4.5,
                  amenities: ['WiFi', 'Pool', 'Spa', 'Gym'],
                  image: '/images/millennium.jpg',
                  description: 'Luxury hotel in the heart of Doha'
                },
                {
                  id: 'steigenberger',
                  name: 'Steigenberger Hotel Doha',
                  category: 'Premium',
                  pricePerNight: 180,
                  rating: 4.7,
                  amenities: ['WiFi', 'Pool', 'Spa', 'Business Center'],
                  image: '/images/steigenberger.jpg',
                  description: 'Modern luxury with traditional hospitality'
                }
              ],
              selectedCategoryId: 'premium'
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Verify hotel information is displayed
      expect(screen.getByText('Millennium Hotel Doha')).toBeInTheDocument();
      expect(screen.getByText('Steigenberger Hotel Doha')).toBeInTheDocument();
      expect(screen.getByText('$150/night')).toBeInTheDocument();
      expect(screen.getByText('$180/night')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('4.7')).toBeInTheDocument();
      expect(screen.getByText('Luxury hotel in the heart of Doha')).toBeInTheDocument();
      expect(screen.getByText('Modern luxury with traditional hospitality')).toBeInTheDocument();

      // Verify amenities are shown
      expect(screen.getAllByText('Pool')).toHaveLength(2);
      expect(screen.getAllByText('Spa')).toHaveLength(2);
      expect(screen.getByText('Business Center')).toBeInTheDocument();
    });

    it('should handle hotel selection interaction', async () => {
      const message: Message = {
        id: '2',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Choose your hotel:',
          richContent: {
            type: 'hotels',
            data: {
              hotels: [
                {
                  id: 'millennium',
                  name: 'Millennium Hotel Doha',
                  category: 'Premium',
                  pricePerNight: 150,
                  rating: 4.5,
                  amenities: ['WiFi', 'Pool'],
                  image: '/images/millennium.jpg',
                  description: 'Luxury hotel'
                }
              ]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      const selectButton = screen.getByText('Select Hotel');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockOnRichContentAction).toHaveBeenCalledWith('selectHotel', {
          id: 'millennium',
          name: 'Millennium Hotel Doha',
          category: 'Premium',
          pricePerNight: 150
        });
      });
    });
  });

  describe('Stopover Options UI Component', () => {
    it('should render timing and duration options from selectHotel function', () => {
      const message: Message = {
        id: '3',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Configure your stopover:',
          richContent: {
            type: 'stopover-options',
            data: {
              selectedHotelId: 'millennium',
              originalRoute: {
                origin: 'LHR',
                destination: 'BKK'
              }
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Verify timing options
      expect(screen.getByText('Outbound Journey')).toBeInTheDocument();
      expect(screen.getByText('Return Journey')).toBeInTheDocument();
      expect(screen.getByText('LHR → DOH → BKK')).toBeInTheDocument();
      expect(screen.getByText('BKK → DOH → LHR')).toBeInTheDocument();

      // Verify duration options
      expect(screen.getByText('1 Night')).toBeInTheDocument();
      expect(screen.getByText('2 Nights')).toBeInTheDocument();
      expect(screen.getByText('3 Nights')).toBeInTheDocument();
      expect(screen.getByText('4 Nights')).toBeInTheDocument();
    });

    it('should handle timing and duration selection', async () => {
      const message: Message = {
        id: '3',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Configure your stopover:',
          richContent: {
            type: 'stopover-options',
            data: {
              selectedHotelId: 'millennium',
              originalRoute: { origin: 'LHR', destination: 'BKK' }
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Select outbound timing
      const outboundButton = screen.getByText('Outbound Journey');
      fireEvent.click(outboundButton);

      // Select 2 nights duration
      const twoNightsButton = screen.getByText('2 Nights');
      fireEvent.click(twoNightsButton);

      // Confirm selection
      const confirmButton = screen.getByText('Confirm Selection');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnRichContentAction).toHaveBeenCalledWith('selectTiming', {
          timing: 'outbound',
          duration: 2
        });
      });
    });
  });

  describe('Stopover Extras UI Component', () => {
    it('should render extras selection from selectTimingAndDuration function', () => {
      const message: Message = {
        id: '4',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Add extras to enhance your stay:',
          richContent: {
            type: 'stopover-extras',
            data: {
              transfers: {
                id: 'airport-transfer',
                name: 'Airport Transfers',
                description: 'Round-trip transfers between airport and hotel',
                price: 60,
                included: false
              },
              tours: [
                {
                  id: 'whale-sharks',
                  name: 'Whale Sharks of Qatar',
                  description: 'Swimming with whale sharks experience',
                  duration: '4 hours',
                  price: 195,
                  image: '/images/whale-sharks.jpg',
                  highlights: ['Swimming with whale sharks', 'Professional guide', 'Equipment included']
                },
                {
                  id: 'desert-safari',
                  name: 'Desert Safari Adventure',
                  description: 'Thrilling desert safari with dune bashing',
                  duration: '6 hours',
                  price: 150,
                  image: '/images/desert-safari.jpg',
                  highlights: ['Dune bashing', 'Camel riding', 'Traditional dinner']
                }
              ],
              passengers: 2,
              selectedTiming: 'outbound',
              selectedDuration: 2
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Verify transfers section
      expect(screen.getByText('Airport Transfers')).toBeInTheDocument();
      expect(screen.getByText('Round-trip transfers between airport and hotel')).toBeInTheDocument();
      expect(screen.getByText('$60')).toBeInTheDocument();

      // Verify tours section
      expect(screen.getByText('Whale Sharks of Qatar')).toBeInTheDocument();
      expect(screen.getByText('Desert Safari Adventure')).toBeInTheDocument();
      expect(screen.getByText('Swimming with whale sharks experience')).toBeInTheDocument();
      expect(screen.getByText('Thrilling desert safari with dune bashing')).toBeInTheDocument();
      expect(screen.getByText('$195')).toBeInTheDocument();
      expect(screen.getByText('$150')).toBeInTheDocument();

      // Verify tour highlights
      expect(screen.getByText('Swimming with whale sharks')).toBeInTheDocument();
      expect(screen.getByText('Professional guide')).toBeInTheDocument();
      expect(screen.getByText('Dune bashing')).toBeInTheDocument();
      expect(screen.getByText('Camel riding')).toBeInTheDocument();
    });

    it('should handle extras selection with quantity controls', async () => {
      const message: Message = {
        id: '4',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Add extras:',
          richContent: {
            type: 'stopover-extras',
            data: {
              transfers: { id: 'transfers', name: 'Transfers', price: 60, included: false },
              tours: [
                {
                  id: 'whale-sharks',
                  name: 'Whale Sharks',
                  price: 195,
                  description: 'Swimming experience',
                  duration: '4 hours',
                  image: '/images/whale.jpg',
                  highlights: ['Swimming']
                }
              ],
              passengers: 2
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Toggle transfers
      const transfersToggle = screen.getByRole('checkbox', { name: /transfers/i });
      fireEvent.click(transfersToggle);

      // Add tour quantity
      const addTourButton = screen.getByText('+');
      fireEvent.click(addTourButton);

      // Confirm extras selection
      const confirmButton = screen.getByText('Continue with Selection');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnRichContentAction).toHaveBeenCalledWith('selectExtras', {
          includeTransfers: true,
          selectedTours: expect.arrayContaining([
            expect.objectContaining({
              tourId: 'whale-sharks',
              quantity: 1
            })
          ]),
          totalExtrasPrice: expect.any(Number)
        });
      });
    });
  });

  describe('Booking Summary UI Component', () => {
    it('should render booking summary from selectExtras function', () => {
      const message: Message = {
        id: '5',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Here is your booking summary:',
          richContent: {
            type: 'summary',
            data: {
              title: 'Booking Summary',
              flightRoute: {
                origin: 'LHR',
                destination: 'BKK',
                stopover: 'DOH',
                timing: 'Outbound',
                duration: '2 nights'
              },
              sections: [
                {
                  title: 'Hotel Details',
                  items: [
                    { label: 'Hotel', value: 'Millennium Hotel Doha' },
                    { label: 'Category', value: 'Premium' },
                    { label: 'Duration', value: '2 nights' }
                  ]
                },
                {
                  title: 'Extras',
                  items: [
                    { label: 'Airport Transfers', value: '$60' },
                    { label: 'Whale Sharks Tour (2x)', value: '$390' }
                  ]
                }
              ],
              pricing: {
                breakdown: [
                  { label: 'Hotel (2 nights)', value: '$300' },
                  { label: 'Flight fare difference', value: '$115' },
                  { label: 'Airport transfers', value: '$60' },
                  { label: 'Tours', value: '$390' }
                ],
                total: '$865',
                aviosEquivalent: '108,125 Avios'
              },
              actions: [
                { type: 'payment', label: 'Proceed to Payment', primary: true }
              ]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Verify summary title
      expect(screen.getByText('Booking Summary')).toBeInTheDocument();

      // Verify flight route visualization
      expect(screen.getByText('Flight Route')).toBeInTheDocument();
      expect(screen.getByText('LHR')).toBeInTheDocument();
      expect(screen.getByText('BKK')).toBeInTheDocument();
      expect(screen.getByText('DOH')).toBeInTheDocument();
      expect(screen.getByText('Outbound • 2 nights')).toBeInTheDocument();

      // Verify hotel details section
      expect(screen.getByText('Hotel Details')).toBeInTheDocument();
      expect(screen.getByText('Millennium Hotel Doha')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();

      // Verify extras section
      expect(screen.getByText('Extras')).toBeInTheDocument();
      expect(screen.getByText('Airport Transfers')).toBeInTheDocument();
      expect(screen.getByText('Whale Sharks Tour (2x)')).toBeInTheDocument();

      // Verify pricing breakdown
      expect(screen.getByText('Hotel (2 nights)')).toBeInTheDocument();
      expect(screen.getByText('$300')).toBeInTheDocument();
      expect(screen.getByText('Flight fare difference')).toBeInTheDocument();
      expect(screen.getByText('$115')).toBeInTheDocument();
      expect(screen.getByText('$865')).toBeInTheDocument();
      expect(screen.getByText('108,125 Avios')).toBeInTheDocument();

      // Verify action button
      expect(screen.getByText('Proceed to Payment')).toBeInTheDocument();
    });

    it('should handle payment action from summary', async () => {
      const message: Message = {
        id: '5',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Summary ready:',
          richContent: {
            type: 'summary',
            data: {
              title: 'Booking Summary',
              pricing: { total: '$865' },
              actions: [{ type: 'payment', label: 'Proceed to Payment', primary: true }]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      const paymentButton = screen.getByText('Proceed to Payment');
      fireEvent.click(paymentButton);

      await waitFor(() => {
        expect(mockOnRichContentAction).toHaveBeenCalledWith('payment', {
          type: 'payment',
          label: 'Proceed to Payment',
          primary: true
        });
      });
    });
  });

  describe('Payment Form UI Component', () => {
    it('should render payment form from initiatePayment function', () => {
      const message: Message = {
        id: '6',
        sender: 'agent',
        content: {
          type: 'form',
          text: 'Please complete your payment:',
          formData: {
            type: 'payment',
            fields: [
              { id: 'cardNumber', type: 'text', label: 'Card Number', required: true },
              { id: 'expiryDate', type: 'text', label: 'Expiry Date (MM/YY)', required: true },
              { id: 'cvv', type: 'text', label: 'CVV', required: true },
              { id: 'nameOnCard', type: 'text', label: 'Name on Card', required: true }
            ],
            submitLabel: 'Complete Payment',
            data: {
              totalAmount: 865,
              totalAviosPrice: 108125,
              aviosBalance: 275000
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onFormSubmit={mockOnFormSubmit}
        />
      );

      // Verify payment tabs
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Pay with Avios')).toBeInTheDocument();

      // Verify credit card form fields
      expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();

      // Verify submit button
      expect(screen.getByText('Complete Payment')).toBeInTheDocument();
    });

    it('should handle payment form submission with validation', async () => {
      const message: Message = {
        id: '6',
        sender: 'agent',
        content: {
          type: 'form',
          text: 'Payment form:',
          formData: {
            type: 'payment',
            fields: [
              { id: 'cardNumber', type: 'text', label: 'Card Number', required: true }
            ],
            submitLabel: 'Pay Now'
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onFormSubmit={mockOnFormSubmit}
        />
      );

      // Fill in valid card number
      const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
      fireEvent.change(cardInput, { target: { value: '4111111111111111' } });

      // Submit form
      const submitButton = screen.getByText('Pay Now');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnFormSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            cardNumber: '4111 1111 1111 1111'
          })
        );
      });
    });

    it('should switch between credit card and Avios payment methods', async () => {
      const message: Message = {
        id: '6',
        sender: 'agent',
        content: {
          type: 'form',
          text: 'Payment options:',
          formData: {
            type: 'payment',
            fields: [],
            submitLabel: 'Pay',
            data: { aviosBalance: 275000 }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onFormSubmit={mockOnFormSubmit}
        />
      );

      // Switch to Avios tab
      const aviosTab = screen.getByText('Pay with Avios');
      fireEvent.click(aviosTab);

      // Verify Avios form is shown
      await waitFor(() => {
        expect(screen.getByText('Privilege Club Login')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
        expect(screen.getByText('275,000')).toBeInTheDocument(); // Avios balance
      });
    });
  });

  describe('Booking Confirmation UI Component', () => {
    it('should render booking confirmation from completeBooking function', () => {
      const message: Message = {
        id: '7',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Congratulations! Your booking is confirmed.',
          richContent: {
            type: 'summary',
            data: {
              title: 'Booking Confirmation',
              type: 'confirmation',
              newPNR: 'X9FG1',
              flightRoute: {
                origin: 'LHR',
                destination: 'BKK',
                stopover: 'DOH'
              },
              sections: [
                {
                  title: 'Booking Details',
                  items: [
                    { label: 'Original PNR', value: 'X4HG8' },
                    { label: 'New PNR', value: 'X9FG1', highlight: true },
                    { label: 'Status', value: 'Confirmed' }
                  ]
                }
              ],
              actions: [
                { type: 'email', label: 'Email Confirmation', primary: false },
                { type: 'close', label: 'Close', primary: true }
              ]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Verify confirmation styling
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('Your stopover has been successfully added')).toBeInTheDocument();

      // Verify PNR display
      expect(screen.getAllByText('X9FG1')).toHaveLength(2); // Should appear in confirmation box and details
      expect(screen.getByText('X4HG8')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();

      // Verify action buttons
      expect(screen.getByText('Email Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();

      // Verify success icon is present
      const successIcon = document.querySelector('.bg-green-500');
      expect(successIcon).toBeInTheDocument();
    });

    it('should handle confirmation actions', async () => {
      const message: Message = {
        id: '7',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Booking confirmed!',
          richContent: {
            type: 'summary',
            data: {
              type: 'confirmation',
              newPNR: 'X9FG1',
              actions: [
                { type: 'email', label: 'Email Confirmation', primary: false }
              ]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      const emailButton = screen.getByText('Email Confirmation');
      fireEvent.click(emailButton);

      await waitFor(() => {
        expect(mockOnRichContentAction).toHaveBeenCalledWith('email', {
          type: 'email',
          label: 'Email Confirmation',
          primary: false
        });
      });
    });
  });

  describe('Accessibility and Responsive Design', () => {
    it('should meet accessibility requirements for all UI components', () => {
      const message: Message = {
        id: 'accessibility-test',
        sender: 'agent',
        content: {
          type: 'rich',
          text: 'Accessibility test',
          richContent: {
            type: 'stopover-categories',
            data: {
              categories: [
                {
                  id: 'premium',
                  name: 'Premium',
                  category: 'Premium',
                  pricePerNight: 150,
                  description: 'Luxury accommodation',
                  amenities: ['WiFi'],
                  image: '/images/premium.jpg'
                }
              ]
            }
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onRichContentAction={mockOnRichContentAction}
        />
      );

      // Check for proper button roles and labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        // Buttons should have accessible names
        expect(button).toHaveAttribute('aria-label', expect.any(String));
      });

      // Check for proper heading structure
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        expect(heading).toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', () => {
      const message: Message = {
        id: 'keyboard-test',
        sender: 'agent',
        content: {
          type: 'form',
          text: 'Keyboard test',
          formData: {
            type: 'payment',
            fields: [
              { id: 'cardNumber', type: 'text', label: 'Card Number', required: true }
            ],
            submitLabel: 'Submit'
          }
        },
        timestamp: mockTimestamp
      };

      render(
        <MessageBubble
          message={message}
          sender="agent"
          timestamp={mockTimestamp}
          onFormSubmit={mockOnFormSubmit}
        />
      );

      const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
      
      // Test Tab navigation
      fireEvent.keyDown(cardInput, { key: 'Tab' });
      
      // Test Enter key submission
      fireEvent.change(cardInput, { target: { value: '4111111111111111' } });
      fireEvent.keyDown(cardInput, { key: 'Enter' });

      // Form should handle keyboard events appropriately
      expect(cardInput).toBeInTheDocument();
    });
  });
});