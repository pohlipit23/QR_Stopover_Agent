import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { llmConfig, getModelWithFallback, validateLLMConfig } from '../../lib/llm-config';
import { bookingFunctions } from '../../lib/booking-functions';

// System prompt for Qatar Airways Stopover AI Agent
const generateSystemPrompt = (conversationContext: any) => {
  const { customer, booking, currentStep } = conversationContext;
  
  return `You are a Qatar Airways stopover booking assistant powered by Gemini 2.5 Flash. Your role is to help customers add stopover packages in Doha to their existing flight bookings through natural conversation.

CUSTOMER CONTEXT:
- Name: ${customer?.name || 'Valued Customer'}
- Booking PNR: ${booking?.pnr || 'N/A'}
- Route: ${booking?.route?.origin || 'LHR'} → ${booking?.route?.destination || 'BKK'}
- Passengers: ${booking?.passengers || 2}

CONVERSATION GUIDELINES:
1. Maintain Qatar Airways' professional yet friendly tone
2. Guide customers through: category selection → hotel selection → timing/duration → extras → payment
3. Use available functions to display interactive components when appropriate
4. Always confirm selections before proceeding to the next step
5. Provide clear pricing information at each step
6. Handle questions about Doha attractions and logistics naturally
7. Be conversational and helpful, not robotic

AVAILABLE FUNCTIONS:
- showStopoverCategories: Display stopover category options
- selectStopoverCategory: Process category selection and show hotels
- selectHotel: Process hotel selection and show timing options
- selectTimingAndDuration: Process timing/duration and show extras
- selectExtras: Process extras selection and show summary
- initiatePayment: Start payment process
- completeBooking: Finalize the booking

CURRENT STEP: ${currentStep || 'welcome'}

Remember to be natural and conversational while guiding the customer through their stopover booking journey. Use the functions when the customer is ready to make selections or view options.`;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate LLM configuration
    if (!validateLLMConfig()) {
      return new Response(
        JSON.stringify({ 
          error: 'LLM configuration invalid. Please check environment variables.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages, conversationContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let attemptNumber = 0;
    const maxAttempts = 3;

    while (attemptNumber < maxAttempts) {
      try {
        const model = getModelWithFallback(attemptNumber);
        
        const result = await streamText({
          model,
          messages,
          tools: bookingFunctions,
          system: generateSystemPrompt(conversationContext || {}),
          maxTokens: llmConfig.maxTokens,
          temperature: llmConfig.temperature,
        });

        return result.toAIStreamResponse();
      } catch (error: any) {
        console.error(`LLM attempt ${attemptNumber + 1} failed:`, error);
        
        // If this is the last attempt, throw the error
        if (attemptNumber === maxAttempts - 1) {
          throw error;
        }
        
        attemptNumber++;
        
        // Log fallback attempt
        console.log(`Falling back to model attempt ${attemptNumber + 1}`);
      }
    }

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Return appropriate error response based on error type
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      statusCode = 429;
    } else if (error.message?.includes('context length')) {
      errorMessage = 'Conversation too long. Please start a new conversation.';
      statusCode = 413;
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Authentication failed. Please check API configuration.';
      statusCode = 401;
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        type: error.name || 'UnknownError',
        retryable: statusCode === 429 || statusCode >= 500
      }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};