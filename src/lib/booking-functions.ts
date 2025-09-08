import { z } from 'zod';
import { stopoverCategories } from '../data/stopoverCategories';
import { premiumHotels } from '../data/hotelData';
import { availableTours, whaleSharksTour } from '../data/tourData';
import { defaultTransferOption } from '../data/transferData';

// Define parameter schemas
const emptyCategorySchema = z.object({});
const categorySelectionSchema = z.object({
  categoryId: z.string().describe('The ID of the selected stopover category'),
  categoryName: z.string().describe('The name of the selected category')
});
const hotelSelectionSchema = z.object({
  hotelId: z.string().describe('The ID of the selected hotel'),
  hotelName: z.string().describe('The name of the selected hotel')
});
const timingDurationSchema = z.object({
  timing: z.enum(['outbound', 'return']).describe('Whether stopover is on outbound or return journey'),
  duration: z.number().min(1).max(4).describe('Number of nights for the stopover')
});
const extrasSelectionSchema = z.object({
  includeTransfers: z.boolean().describe('Whether to include airport transfers'),
  selectedTours: z.array(z.object({
    tourId: z.string(),
    tourName: z.string(),
    quantity: z.number(),
    totalPrice: z.number()
  })).describe('Array of selected tours with quantities'),
  totalExtrasPrice: z.number().describe('Total price of all selected extras')
});
const paymentInitiationSchema = z.object({
  paymentMethod: z.enum(['credit-card', 'avios']).describe('Selected payment method'),
  totalAmount: z.number().describe('Total amount to be paid')
});
const bookingCompletionSchema = z.object({
  paymentData: z.object({
    method: z.string(),
    confirmed: z.boolean()
  }).describe('Payment confirmation data')
});

// Function to show stopover categories
export const showStopoverCategories = {
  description: 'Display available stopover categories to the customer with interactive carousel',
  inputSchema: emptyCategorySchema,
  execute: async (params: any) => {
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
};

// Function to handle category selection and show hotels
export const selectStopoverCategory = {
  description: 'Process stopover category selection and display available hotels',
  inputSchema: categorySelectionSchema,
  execute: async ({ categoryId, categoryName }: any) => {
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
};

// Function to handle hotel selection and show timing options
export const selectHotel = {
  description: 'Process hotel selection and display stopover timing and duration options',
  inputSchema: hotelSelectionSchema,
  execute: async ({ hotelId, hotelName }: any) => {
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
};

// Function to handle timing and duration selection
export const selectTimingAndDuration = {
  description: 'Process stopover timing and duration selection, then show extras',
  inputSchema: timingDurationSchema,
  execute: async ({ timing, duration }: any) => {
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
};

// Function to handle extras selection
export const selectExtras = {
  description: 'Process extras selection (transfers and tours) and show booking summary',
  inputSchema: extrasSelectionSchema,
  execute: async ({ includeTransfers, selectedTours, totalExtrasPrice }: any) => {
    const baseHotelCost = 150 * 2; // Assuming 2 nights at $150/night
    const flightFareDifference = 115;
    const transfersCost = includeTransfers ? 60 : 0;
    const toursCost = selectedTours.reduce((sum: number, tour: any) => sum + tour.totalPrice, 0);
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
            { label: 'Hotel (2 nights)', value: `${baseHotelCost}` },
            { label: 'Flight fare difference', value: `${flightFareDifference}` },
            ...(includeTransfers ? [{ label: 'Airport transfers', value: `${transfersCost}` }] : []),
            ...selectedTours.map((tour: any) => ({ 
              label: `${tour.tourName} (${tour.quantity}x)`, 
              value: `${tour.totalPrice}` 
            }))
          ],
          total: `${totalCashPrice}`,
          aviosOption: `${totalAviosPrice.toLocaleString()} Avios`,
          actions: [
            { type: 'payment', label: 'Proceed to Payment', primary: true }
          ]
        }
      },
      message: `Perfect! Here's your complete stopover package summary. Your total is ${totalCashPrice} or ${totalAviosPrice.toLocaleString()} Avios.`
    };
  }
};

// Function to initiate payment
export const initiatePayment = {
  description: 'Initialize the payment process for the stopover booking',
  inputSchema: paymentInitiationSchema,
  execute: async ({ paymentMethod, totalAmount }: any) => {
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
        ? `Please enter your payment details to complete your booking for ${totalAmount}:`
        : `Please login to your Privilege Club account to pay with Avios:`
    };
  }
};

// Function to complete booking
export const completeBooking = {
  description: 'Complete the stopover booking and generate confirmation',
  inputSchema: bookingCompletionSchema,
  execute: async ({ paymentData }: any) => {
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
};

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