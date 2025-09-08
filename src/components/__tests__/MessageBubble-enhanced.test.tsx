import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBubble from '../MessageBubble';
import type { Message } from '../../types';

// Mock the image import
jest.mock('../../assets/images/privilege_club_logo.png', () => 'privilege-club-logo.png');

describe('MessageBubble Enhanced Features', () => {
  const mockTimestamp = new Date('2024-01-01T12:00:00Z');

  describe('Enhanced Payment Form', () => {
    const paymentFormMessage: Message = {
      id: '1',
      sender: 'agent',
      content: {
        type: 'form',
        text: 'Please complete your payment details',
        formData: {
          type: 'payment',
          fields: [],
          submitLabel: 'Complete Payment',
          data: {
            totalAmount: 500,
            totalAviosPrice: 62500,
            aviosBalance: 275000
          }
        }
      },
      timestamp: mockTimestamp
    };

    it('should render payment method tabs', () => {
      render(
        <MessageBubble
          message={paymentFormMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText('Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Pay with Avios')).toBeInTheDocument();
    });

    it('should show credit card fields by default', () => {
      render(
        <MessageBubble
          message={paymentFormMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    });

    it('should switch to Avios fields when Avios tab is clicked', () => {
      render(
        <MessageBubble
          message={paymentFormMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      fireEvent.click(screen.getByText('Pay with Avios'));

      expect(screen.getByText('Privilege Club Login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByText('275,000')).toBeInTheDocument(); // Avios balance
    });

    it('should format credit card number with spaces', () => {
      render(
        <MessageBubble
          message={paymentFormMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
      fireEvent.change(cardInput, { target: { value: '1234567890123456' } });

      expect(cardInput).toHaveValue('1234 5678 9012 3456');
    });

    it('should format expiry date with slash', () => {
      render(
        <MessageBubble
          message={paymentFormMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      const expiryInput = screen.getByPlaceholderText('MM/YY');
      fireEvent.change(expiryInput, { target: { value: '1225' } });

      expect(expiryInput).toHaveValue('12/25');
    });

    it('should show validation errors for invalid credit card data', async () => {
      const mockOnSubmit = jest.fn();
      
      render(
        <MessageBubble
          message={paymentFormMessage}
          sender="agent"
          timestamp={mockTimestamp}
          onFormSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Complete Payment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 16-digit card number')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid expiry date (MM/YY)')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid CVV (3-4 digits)')).toBeInTheDocument();
        expect(screen.getByText('Please enter the name on the card')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation errors for invalid Avios login data', async () => {
      const mockOnSubmit = jest.fn();
      
      render(
        <MessageBubble
          message={paymentFormMessage}
          sender="agent"
          timestamp={mockTimestamp}
          onFormSubmit={mockOnSubmit}
        />
      );

      // Switch to Avios tab
      fireEvent.click(screen.getByText('Pay with Avios'));

      const submitButton = screen.getByText('Complete Payment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        expect(screen.getByText('Please enter your password')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Enhanced Summary Renderer', () => {
    const summaryMessage: Message = {
      id: '2',
      sender: 'agent',
      content: {
        type: 'summary',
        text: 'Here is your booking summary',
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
                  { label: 'Category', value: 'Premium' }
                ]
              }
            ],
            pricing: {
              breakdown: [
                { label: 'Hotel (2 nights)', value: '$300' },
                { label: 'Flight fare difference', value: '$115' }
              ],
              total: '$415',
              aviosEquivalent: '51,875 Avios'
            }
          }
        }
      },
      timestamp: mockTimestamp
    };

    it('should render flight route visualization', () => {
      render(
        <MessageBubble
          message={summaryMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText('Flight Route')).toBeInTheDocument();
      expect(screen.getByText('LHR')).toBeInTheDocument();
      expect(screen.getByText('BKK')).toBeInTheDocument();
      expect(screen.getByText('DOH')).toBeInTheDocument();
      expect(screen.getByText('Outbound • 2 nights')).toBeInTheDocument();
    });

    it('should render structured sections', () => {
      render(
        <MessageBubble
          message={summaryMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText('Hotel Details')).toBeInTheDocument();
      expect(screen.getByText('Millennium Hotel Doha')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should render pricing breakdown with Avios equivalent', () => {
      render(
        <MessageBubble
          message={summaryMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText('Hotel (2 nights)')).toBeInTheDocument();
      expect(screen.getByText('$300')).toBeInTheDocument();
      expect(screen.getByText('Flight fare difference')).toBeInTheDocument();
      expect(screen.getByText('$115')).toBeInTheDocument();
      expect(screen.getByText('$415')).toBeInTheDocument();
      expect(screen.getByText(/51,875 Avios/)).toBeInTheDocument();
    });
  });

  describe('Booking Confirmation Summary', () => {
    const confirmationMessage: Message = {
      id: '3',
      sender: 'agent',
      content: {
        type: 'summary',
        text: 'Your booking has been confirmed!',
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
                  { label: 'New PNR', value: 'X9FG1', highlight: true }
                ]
              }
            ]
          }
        }
      },
      timestamp: mockTimestamp
    };

    it('should render confirmation styling with success indicator', () => {
      render(
        <MessageBubble
          message={confirmationMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('Your stopover has been successfully added')).toBeInTheDocument();
      expect(screen.getByText('New PNR:')).toBeInTheDocument();
      expect(screen.getAllByText('X9FG1')).toHaveLength(2); // Should appear twice - in confirmation box and details
    });

    it('should highlight important values', () => {
      render(
        <MessageBubble
          message={confirmationMessage}
          sender="agent"
          timestamp={mockTimestamp}
        />
      );

      const highlightedPNR = screen.getAllByText('X9FG1')[1]; // Second occurrence in the details
      expect(highlightedPNR).toHaveClass('text-primary-burgundy');
    });
  });
});