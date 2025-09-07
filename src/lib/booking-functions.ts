import { z } from 'zod';
import { tool } from 'ai';
import { stopoverCategories } from '../data/stopoverCategories';
import { premiumHotels } from '../data/hotelData';
import { availableTours, whaleSharksTour } from '../data/tourData';
import { defaultTransferOption } from '../data/transferData';

// Function to show stopover categories
export const showStopoverCategories = tool({
  description: 'Display available stopover categories to the customer with interactive carousel',
  parameters: z.object({}),
  execute: async () => {
    return {
      success: true,
      categories: stopoverCategories,
      uiComponent: {
        type: 'stopover-categories',
        data: {
          categories: stopoverCategories
        }
      },
      message: 'Here are our stopover categories. Each offers different levels of comfort and amenities:'
    };
  }
});

// Function to handle category selection and show hotels
export const selectStopoverCategory = tool({
  description: 'Process stopover category selection and display available hotels',
  parameters: z.object({
    categoryId: z.string().describe('The ID of the selected stopover category'),
    categoryName: z.string().describe('The name of the selected category')
  }),
  execute: async ({ categoryId, categoryName }) => {
    return {
      success: true,
      selectedCategory: categoryId,
      hotels: premiumHotels,
      uiComponent: {
        type: 'hotels',
        data: {
          hotels: premiumHotels,
          selectedCategoryId: categoryId
        }
      },
      message: `Great choice! You've selected the ${categoryName} category. Now let's choose your hotel from our premium selection:`
    };
  }
});

// Function to handle hotel selection and show timing options
export const selectHotel = tool({
  description: 'Process hotel selection and display stopover timing and duration options',
  parameters: z.object({
    hotelId: z.string().describe('The ID of the selected hotel'),
    hotelName: z.string().describe('The name of the selected hotel')
  }),
  execute: async ({ hotelId, hotelName }) => {
    return {
      success: true,
      selectedHotel: hotelId,
      uiComponent: {
        type: 'stopover-options',
        data: {
          selectedHotelId: hotelId,
          originalRoute: {
            origin: 'LHR',
            destination: 'BKK'
          }
        }
      },
      message: `Perfect! You've selected ${hotelName}. Now let's configure when you'd like your stopover and for how long:`
    };
  }
});

// Function to handle timing and duration selection
export const selectTimingAndDuration = tool({
  description: 'Process stopover timing and duration selection, then show extras',
  parameters: z.object({
    timing: z.enum(['outbound', 'return']).describe('Whether stopover is on outbound or return journey'),
    duration: z.number().min(1).max(4).describe('Number of nights for the stopover')
  }),
  execute: async ({ timing, duration }) => {
    return {
      success: true,
      selectedTiming: timing,
      selectedDuration: duration,
      uiComponent: {
        type: 'stopover-extras',
        data: {
          transfers: defaultTransferOption,
          tours: availableTours,
          recommendedTour: whaleSharksTour,
          passengers: 2,
          selectedTiming: timing,
          selectedDuration: duration
        }
      },
      message: `Excellent! You've chosen a ${duration}-night ${timing} stopover. Now let's enhance your experience with some optional extras:`
    };
  }
});

// Function to handle extras selection
export const selectExtras = tool({
  description: 'Process extras selection (transfers and tours) and show booking summary',
  parameters: z.object({
    includeTransfers: z.boolean().describe('Whether to include airport transfers'),
    selectedTours: z.array(z.object({
      tourId: z.string(),
      tourName: z.string(),
      quantity: z.number(),
      totalPrice: z.number()
    })).describe('Array of selected tours with quantities'),
    totalExtrasPrice: z.number().describe('Total price of all selected extras')
  }),
  execute: async ({ includeTransfers, selectedTours, totalExtrasPrice }) => {
    const baseHotelCost = 150 * 2; // Assuming 2 nights at $150/night
    const flightFareDifference = 115;
    const transfersCost = includeTransfers ? 60 : 0;
    const toursCost = selectedTours.reduce((sum, tour) => sum + tour.totalPrice, 0);
    const totalCashPrice = baseHotelCost + flightFareDifference + transfersCost + toursCost;
    const totalAviosPrice = totalCashPrice * 125; // 125 Avios per $1

    return {
      success: true,
      selectedExtras: {
        transfers: includeTransfers,
        tours: selectedTours,
        totalExtrasPrice
      },
      pricing: {
        hotelCost: baseHotelCost,
        flightFareDifference,
        transfersCost,
        toursCost,
        totalCashPrice,
        totalAviosPrice
      },
      uiComponent: {
        type: 'summary',
        data: {
          title: 'Booking Summary',
          items: [
            { label: 'Hotel (2 nights)', value: `$${baseHotelCost}` },
            { label: 'Flight fare difference', value: `$${flightFareDifference}` },
            ...(includeTransfers ? [{ label: 'Airport transfers', value: `$${transfersCost}` }] : []),
            ...selectedTours.map(tour => ({ 
              label: `${tour.tourName} (${tour.quantity}x)`, 
              value: `$${tour.totalPrice}` 
            }))
          ],
          total: `$${totalCashPrice}`,
          aviosOption: `${totalAviosPrice.toLocaleString()} Avios`,
          actions: [
            { type: 'payment', label: 'Proceed to Payment', primary: true }
          ]
        }
      },
      message: `Perfect! Here's your complete stopover package summary. Your total is $${totalCashPrice} or ${totalAviosPrice.toLocaleString()} Avios.`
    };
  }
});

// Function to initiate payment
export const initiatePayment = tool({
  description: 'Initialize the payment process for the stopover booking',
  parameters: z.object({
    paymentMethod: z.enum(['credit-card', 'avios']).describe('Selected payment method'),
    totalAmount: z.number().describe('Total amount to be paid')
  }),
  execute: async ({ paymentMethod, totalAmount }) => {
    return {
      success: true,
      paymentInitialized: true,
      uiComponent: {
        type: 'form',
        data: {
          type: 'payment',
          fields: paymentMethod === 'credit-card' ? [
            { id: 'cardNumber', type: 'text', label: 'Card Number', required: true },
            { id: 'expiryDate', type: 'text', label: 'Expiry Date (MM/YY)', required: true },
            { id: 'cvv', type: 'text', label: 'CVV', required: true },
            { id: 'nameOnCard', type: 'text', label: 'Name on Card', required: true }
          ] : [
            { id: 'privilegeClubId', type: 'text', label: 'Privilege Club ID', required: true },
            { id: 'password', type: 'password', label: 'Password', required: true }
          ],
          submitLabel: paymentMethod === 'credit-card' ? 'Pay Now' : 'Login & Pay with Avios'
        }
      },
      message: paymentMethod === 'credit-card' 
        ? `Please enter your payment details to complete your booking for $${totalAmount}:`
        : `Please login to your Privilege Club account to pay with Avios:`
    };
  }
});

// Function to complete booking
export const completeBooking = tool({
  description: 'Complete the stopover booking and generate confirmation',
  parameters: z.object({
    paymentData: z.object({
      method: z.string(),
      confirmed: z.boolean()
    }).describe('Payment confirmation data')
  }),
  execute: async ({ paymentData }) => {
    const newPNR = 'X9FG1';
    
    return {
      success: true,
      bookingComplete: true,
      newPNR,
      uiComponent: {
        type: 'summary',
        data: {
          title: 'Booking Confirmed!',
          items: [
            { label: 'New PNR', value: newPNR },
            { label: 'Stopover Location', value: 'Doha (DOH)' },
            { label: 'Payment Method', value: paymentData.method === 'credit-card' ? 'Credit Card' : 'Avios' },
            { label: 'Status', value: 'Confirmed' }
          ],
          actions: [
            { type: 'email', label: 'Email Confirmation', primary: false },
            { type: 'close', label: 'Close', primary: true }
          ]
        }
      },
      message: `🎉 Congratulations! Your stopover booking is confirmed. Your new PNR is ${newPNR}. You'll receive a confirmation email shortly with all the details.`
    };
  }
});

// Export all booking functions
export const bookingFunctions = {
  showStopoverCategories,
  selectStopoverCategory,
  selectHotel,
  selectTimingAndDuration,
  selectExtras,
  initiatePayment,
  completeBooking
};