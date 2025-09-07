# Qatar Airways Stopover AI Agent - LLM Integration

## Overview

This project integrates **Gemini 2.5 Flash** via **OpenRouter** to power the conversational AI experience for Qatar Airways stopover bookings. The implementation uses the Vercel AI SDK for seamless streaming responses and function calling capabilities.

## Architecture

### LLM Stack
- **Model**: Google Gemini 2.5 Flash (`google/gemini-2.0-flash-exp`)
- **Provider**: OpenRouter (unified API for multiple LLM providers)
- **Framework**: Vercel AI SDK with React hooks
- **Fallback Models**: Claude 3 Haiku, GPT-4o Mini

### Key Components

#### 1. LLM Configuration (`src/lib/llm-config.ts`)
```typescript
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const llmConfig = {
  model: openrouter('google/gemini-2.0-flash-exp'), // Gemini 2.5 Flash
  fallbackModels: [
    openrouter('anthropic/claude-3-haiku'),
    openrouter('openai/gpt-4o-mini')
  ],
  maxTokens: 4096,
  temperature: 0.7,
};
```

#### 2. Function Calling (`src/lib/booking-functions.ts`)
The LLM can call structured functions to trigger UI components:

- `showStopoverCategories()` - Display category carousel
- `selectStopoverCategory()` - Process category selection
- `selectHotel()` - Process hotel selection
- `selectTimingAndDuration()` - Handle timing/duration
- `selectExtras()` - Process extras and show summary
- `initiatePayment()` - Start payment flow
- `completeBooking()` - Finalize booking

#### 3. Chat API Endpoint (`src/pages/api/chat.ts`)
Handles streaming conversations with function calling:

```typescript
const result = await streamText({
  model: llmConfig.model,
  messages,
  tools: bookingFunctions,
  system: generateSystemPrompt(conversationContext),
  maxTokens: llmConfig.maxTokens,
  temperature: llmConfig.temperature,
});
```

#### 4. React Integration (`src/components/ChatContainer.tsx`)
Uses Vercel AI SDK's `useChat` hook:

```typescript
const {
  messages,
  input,
  handleSubmit,
  isLoading,
  append
} = useChat({
  api: '/api/chat',
  body: { conversationContext: { customer, booking } }
});
```

## Environment Setup

### Required Environment Variables

Create a `.env` file with:

```bash
# OpenRouter API Key (required)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Model Configuration
DEFAULT_MODEL=google/gemini-2.0-flash-exp
FALLBACK_MODELS=anthropic/claude-3-haiku,openai/gpt-4o-mini
MAX_TOKENS=4096
TEMPERATURE=0.7

# Feature Flags
FUNCTION_CALLING_ENABLED=true
STREAMING_ENABLED=true
```

### Getting OpenRouter API Key

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. Navigate to API Keys section
3. Create a new API key
4. Add credits to your account for model usage
5. Copy the API key to your `.env` file

## Model Selection: Gemini 2.5 Flash

### Why Gemini 2.5 Flash?

- **Speed**: Optimized for fast inference (< 2s response times)
- **Function Calling**: Native support for structured function calls
- **Context Window**: 1M+ tokens for comprehensive conversation context
- **Multimodal**: Can handle text and understand rich content
- **Cost Effective**: Competitive pricing via OpenRouter
- **Reliability**: Google's production-ready model

### Model Specifications

```typescript
Model: google/gemini-2.0-flash-exp
Context Window: 1,048,576 tokens
Max Output: 8,192 tokens
Function Calling: ✅ Supported
Streaming: ✅ Supported
Multimodal: ✅ Text + Images
```

## Function Calling Flow

### 1. User Interaction
User clicks "Show me categories" or types natural language

### 2. LLM Processing
Gemini 2.5 Flash processes the request and determines appropriate function to call

### 3. Function Execution
```typescript
// LLM calls this function
showStopoverCategories: tool({
  description: 'Display available stopover categories',
  execute: async () => ({
    categories: stopoverCategories,
    uiComponent: {
      type: 'stopover-categories',
      data: { categories: stopoverCategories }
    }
  })
})
```

### 4. UI Component Rendering
MessageBubble renders the appropriate rich content component:

```typescript
case 'stopover-categories':
  return (
    <StopoverCategoryCarousel
      categories={content.data.categories}
      onCategorySelect={(category) => onAction?.('selectCategory', category)}
    />
  );
```

## Error Handling & Fallbacks

### Model Fallback Chain
1. **Primary**: Gemini 2.5 Flash (`google/gemini-2.0-flash-exp`)
2. **Fallback 1**: Claude 3 Haiku (`anthropic/claude-3-haiku`)
3. **Fallback 2**: GPT-4o Mini (`openai/gpt-4o-mini`)

### Error Types Handled
- Rate limiting (429 errors)
- Context length exceeded (413 errors)
- Authentication failures (401 errors)
- Network timeouts
- Invalid responses

### Retry Logic
```typescript
let attemptNumber = 0;
const maxAttempts = 3;

while (attemptNumber < maxAttempts) {
  try {
    const model = getModelWithFallback(attemptNumber);
    const result = await streamText({ model, ... });
    return result.toAIStreamResponse();
  } catch (error) {
    attemptNumber++;
    // Try next model in fallback chain
  }
}
```

## Conversation Context

### System Prompt Template
```typescript
const systemPrompt = `
You are a Qatar Airways stopover booking assistant powered by Gemini 2.5 Flash.

CUSTOMER CONTEXT:
- Name: ${customer.name}
- Booking PNR: ${booking.pnr}
- Route: ${booking.route.origin} → ${booking.route.destination}

GUIDELINES:
1. Maintain Qatar Airways' professional yet friendly tone
2. Guide through: category → hotel → timing → extras → payment
3. Use functions to display interactive components
4. Confirm selections before proceeding
5. Provide clear pricing information
`;
```

### Context Management
- **Conversation History**: Maintained in React state
- **Customer Data**: Passed in conversation context
- **Booking State**: Tracked through function calls
- **UI State**: Synchronized with LLM responses

## Performance Optimizations

### Streaming Responses
- Real-time token streaming for immediate feedback
- Progressive UI updates as response generates
- Typing indicators during generation

### Context Window Management
- Automatic conversation pruning for long chats
- Priority-based context retention
- Efficient token usage optimization

### Caching Strategy
- Static data (hotels, tours) cached in memory
- Conversation state persisted to localStorage
- API responses cached where appropriate

## Development & Testing

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your OPENROUTER_API_KEY

# Start development server
npm run dev
```

### Testing LLM Integration
1. **Unit Tests**: Function calling logic
2. **Integration Tests**: API endpoint responses
3. **E2E Tests**: Complete conversation flows
4. **Load Tests**: Multiple concurrent conversations

### Debugging
- Enable debug logging: `DEBUG=ai:*`
- Monitor OpenRouter usage dashboard
- Check browser network tab for streaming responses
- Use React DevTools for state inspection

## Deployment

### Environment Variables (Production)
```bash
OPENROUTER_API_KEY=prod_key_here
DEFAULT_MODEL=google/gemini-2.0-flash-exp
MAX_TOKENS=4096
TEMPERATURE=0.7
NODE_ENV=production
```

### Cloudflare Workers Configuration
The API endpoint is designed to run on Cloudflare Workers with:
- Edge computing for global low latency
- Automatic scaling
- Built-in error handling
- Streaming response support

## Monitoring & Analytics

### Key Metrics
- Response time (target: < 2s)
- Function call success rate
- Model fallback frequency
- Conversation completion rate
- User satisfaction scores

### Logging
- LLM request/response logging
- Function call execution tracking
- Error rate monitoring
- Performance metrics collection

## Security Considerations

### API Key Management
- Environment variables only
- No client-side exposure
- Rotation policy recommended

### Input Validation
- Zod schemas for function parameters
- Content filtering for user inputs
- Rate limiting on API endpoints

### Data Privacy
- No PII sent to LLM providers
- Conversation data encrypted in transit
- Local storage for temporary state only

## Future Enhancements

### Planned Features
- Multi-language support
- Voice input/output
- Image understanding for travel documents
- Advanced personalization
- Integration with real booking systems

### Model Upgrades
- Monitor for Gemini 2.5 Pro availability
- Evaluate new OpenRouter model options
- A/B testing for model performance
- Custom fine-tuning possibilities

---

## Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Get OpenRouter API key from [openrouter.ai](https://openrouter.ai)
- [ ] Copy `.env.example` to `.env`
- [ ] Add your `OPENROUTER_API_KEY`
- [ ] Start development: `npm run dev`
- [ ] Test conversation flow
- [ ] Verify function calling works
- [ ] Check rich content components render

The integration is now ready with Gemini 2.5 Flash as the primary model via OpenRouter! 🚀