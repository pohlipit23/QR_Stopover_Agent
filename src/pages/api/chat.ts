import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables explicitly
dotenv.config();
import { createLLMConfig, getModelWithFallback, validateServerLLMConfig } from '../../lib/llm-config-server';
import { bookingFunctions } from '../../lib/booking-functions';
import { securityMiddleware } from '../../utils/security';
import { cacheMiddleware } from '../../utils/caching';
import { logger, analytics, errorReporter } from '../../utils/monitoring';
import { measurePerformance } from '../../utils/performance';
import { createDataAccessManager } from '../../lib/cloudflare/data-access';
import { createErrorHandler } from '../../lib/cloudflare/error-handling';

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

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin') || '';
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin.includes('localhost') ? origin : 'http://localhost:4321',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  let currentModel = 'unknown';
  
  // Initialize data services (in production, env would be injected by Cloudflare Workers)
  const errorHandler = createErrorHandler();
  let dataManager: any = null;
  
  try {
    // Try to initialize data services (will use fallbacks in development)
    try {
      const env = {
        QATAR_STOPOVER_KV: null,
        QATAR_STOPOVER_ASSETS: null,
        CONVERSATION_STATE: null,
      };
      dataManager = createDataAccessManager(env);
    } catch (error) {
      logger.warn('Data services not available, using fallbacks', { error });
    }
    
    // Basic CORS headers only (no complex security middleware for streaming)
    const origin = request.headers.get('origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin.includes('localhost') ? origin : 'http://localhost:4321',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Log request
    logger.info('Chat API request received', {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
    });

    // Track analytics
    analytics.track('chat_api_request', {
      endpoint: '/api/chat',
      method: request.method,
    });

    // Validate LLM configuration
    if (!validateServerLLMConfig()) {
      logger.error('LLM configuration invalid - missing API key');
      return new Response(
        JSON.stringify({ 
          error: 'LLM configuration invalid. Please check environment variables.',
          debug: process.env.NODE_ENV === 'development' ? 'OPENROUTER_API_KEY not found' : undefined
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...securityCheck.headers,
          }
        }
      );
    }

    const { messages, conversationContext, sessionId, conversationId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle conversation state management if data services are available
    if (dataManager && conversationId) {
      try {
        // Update conversation state with new message
        await errorHandler.handleDurableObjectError(
          () => dataManager.addMessage(conversationId, 'user', messages[messages.length - 1]),
          'add-message'
        );
        
        // Get current conversation state for context
        const conversationState = await errorHandler.handleDurableObjectError(
          () => dataManager.getConversationState(conversationId),
          'get-conversation-state'
        );
        
        if (conversationState) {
          // Merge conversation state into context
          conversationContext.conversationHistory = conversationState.messages || [];
          conversationContext.bookingState = conversationState.bookingState || {};
        }
      } catch (error) {
        logger.warn('Failed to update conversation state', { error, conversationId });
      }
    }

    let attemptNumber = 0;
    const maxAttempts = 3;

    // Measure LLM performance
    const result = await measurePerformance.llm(async () => {
      while (attemptNumber < maxAttempts) {
        try {
          const model = getModelWithFallback(attemptNumber);
          currentModel = model.modelId || `attempt-${attemptNumber + 1}`;
          
          logger.debug(`Attempting LLM request with model: ${currentModel}`, {
            attempt: attemptNumber + 1,
            totalAttempts: maxAttempts,
          });

          const result = await streamText({
            model,
            messages,
            tools: bookingFunctions,
            system: generateSystemPrompt(conversationContext || {}),
            temperature: createLLMConfig().temperature,
          });

          logger.info('LLM request successful', {
            model: currentModel,
            attempt: attemptNumber + 1,
          });

          return result;
        } catch (error: any) {
          logger.error(`LLM attempt ${attemptNumber + 1} failed`, {
            model: currentModel,
            error: error.message,
            attempt: attemptNumber + 1,
          });
          
          // If this is the last attempt, throw the error
          if (attemptNumber === maxAttempts - 1) {
            throw error;
          }
          
          attemptNumber++;
          
          // Log fallback attempt
          logger.info(`Falling back to next model`, {
            failedModel: currentModel,
            nextAttempt: attemptNumber + 1,
          });
        }
      }
      
      throw new Error('All LLM models failed');
    }, currentModel, { messagesCount: messages.length });

    // Track successful LLM metrics
    const responseTime = Date.now() - startTime;
    analytics.trackLLM({
      model: currentModel,
      tokensUsed,
      responseTime,
      success: true,
    });

    // Create streaming response with minimal headers
    const response = result.toTextStreamResponse();
    
    // Add only essential headers for streaming
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Ensure no compression or caching for streaming
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('Connection', 'keep-alive');

    logger.info('Chat API request completed successfully', {
      model: currentModel,
      responseTime,
      tokensUsed,
    });

    return response;

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logger.error('Chat API error', {
      error: error.message,
      stack: error.stack,
      model: currentModel,
      responseTime,
    });

    // Report error to monitoring
    errorReporter.report(error, {
      endpoint: '/api/chat',
      model: currentModel,
      responseTime,
    });

    // Track failed LLM metrics
    analytics.trackLLM({
      model: currentModel,
      tokensUsed,
      responseTime,
      success: false,
    });
    
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
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
};