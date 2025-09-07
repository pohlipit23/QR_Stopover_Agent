# Design Document

## Overview

The Qatar Airways Stopover AI Agent is designed as a modern, conversational web application that seamlessly integrates into existing Qatar Airways customer touchpoints. The system employs a sophisticated chat interface with multi-modal input capabilities, rich content rendering, and responsive design principles to deliver an intuitive stopover booking experience.

The architecture follows a component-based approach with clear separation between presentation, interaction logic, and data management layers. The design prioritizes user experience through progressive disclosure, contextual guidance, and consistent brand adherence while maintaining the flexibility to handle various user interaction patterns.

## Requirements Coverage

This design addresses all 13 user stories from the requirements document:

**Requirement 1** - Multiple entry points supported through EmailTemplate and MMBPage components with floating chat integration
**Requirement 2** - Multi-modal interaction enabled via MultiModalInput component supporting text, voice, and button inputs
**Requirement 3** - Stopover category selection through StopoverCategoryCarousel component with four category options
**Requirement 4** - Hotel selection through HotelCarousel component with five premium category hotels
**Requirement 5** - Timing and duration selection via StopoverOptions component with radio buttons and duration picker
**Requirement 6** - Automatic tour recommendation via enhanced StopoverExtras component with "Whale Sharks of Qatar" featured display
**Requirement 7** - Optional extras management through StopoverExtras and ToursCarousel components with basket functionality
**Requirement 8** - Comprehensive booking review via enhanced BookingSummary component including all selections and pricing
**Requirement 9** - Secure payment processing through PaymentForm component with multiple payment methods
**Requirement 10** - Privilege Club login and Avios payment through enhanced PaymentForm with authentication flow
**Requirement 11** - Full responsive design implemented across all components with mobile-first approach
**Requirement 12** - Qatar Airways design system integration through systematic component styling and brand consistency
**Requirement 13** - Consistent sample data management through structured data models and static data layer

## Architecture

### High-Level Architectural Framework

This application follows a modern, cloud-native architecture built on Cloudflare's edge computing platform, ensuring global distribution, high performance, and scalability.

#### Architectural Diagram

```mermaid
graph TB
    subgraph "USER'S BROWSER"
        UB[User's Browser / Client]
    end
    
    subgraph "CLOUDFLARE EDGE NETWORK"
        subgraph "Front-End Layer"
            CP[Astro on Cloudflare Pages]
            GR[Git Repo] --> CP
            CP --> |Serves UI to Client| UB
        end
        
        subgraph "API Layer"
            CW[Hono API on Cloudflare Workers]
            UB --> |API Requests| CW
        end
        
        subgraph "Data & Storage Layer"
            D1[D1 Database<br/>SQL Data]
            KV[KV Store<br/>Cache/Config]
            R2[R2 Storage<br/>Files]
            DO[Durable Objects<br/>State Management]
            
            CW --> D1
            CW --> KV
            CW --> R2
            CW --> DO
        end
    end
```

#### Component Breakdown

**1. Front-End: Astro on Cloudflare Pages**
- **Service**: Cloudflare Pages
- **Framework**: Astro with React components
- **Function**: Serves the chat interface and entry point components with SSR/SSG capabilities
- **CI/CD**: Automatic deployment on git push with built-in CI/CD pipeline
- **Global Distribution**: Static assets cached and served from Cloudflare's global edge network

**2. Back-End API: Hono on Cloudflare Workers**
- **Service**: Cloudflare Workers
- **Framework**: Hono (lightweight, fast web framework for edge environments)
- **Function**: Central hub for business logic, handles API requests from the Astro front-end
- **Endpoint**: Custom domain (api.qatarairways-stopover.com) or route on main domain
- **Responsibility**: Request validation, business logic processing, data layer communication

**3. Data & Storage Layers**
- **D1 Database**: Primary database for structured data (customer profiles, booking data, hotel information)
- **KV Store**: Configuration settings, feature flags, and frequently accessed cached data
- **R2 Storage**: Large files, images, and static assets with zero egress fees
- **Durable Objects**: Stateful services for conversation state management and booking sessions

**4. Stateful Services: Durable Objects**
- **Service**: Durable Objects for strong consistency and state management
- **Function**: Manages conversation state, booking sessions, and real-time interactions
- **Use Case**: Shopping cart management, booking session coordination, conversation flow state
- **Integration**: Hono API forwards stateful requests to specific Durable Object instances

### Application Architecture

```mermaid
graph TB
    A[Entry Points] --> B[Chat Interface Core]
    B --> C[Conversation Engine]
    B --> D[UI Component Library]
    B --> E[State Management]
    
    A1[Email Entry] --> A
    A2[MMB Entry] --> A
    
    C --> C1[Message Handler]
    C --> C2[Flow Controller]
    C --> C3[LLM Integration Layer]
    
    C3 --> C4[OpenRouter Client]
    C4 --> C5[Gemini 2.5 Flash Model]
    C3 --> C6[Vercel AI SDK]
    C3 --> C7[Prompt Engineering]
    
    D --> D1[Chat Components]
    D --> D2[Form Components]
    D --> D3[Card Components]
    D --> D4[Input Components]
    
    E --> E1[Booking State]
    E --> E2[UI State]
    E --> E3[Customer Data]
    E --> E4[Conversation Context]
    
    F[Static Data Layer] --> C
    F --> F1[Customer Data]
    F --> F2[Hotel Data]
    F --> F3[Pricing Data]
```

### Component Architecture

The application is structured around four main architectural layers, built on the Cloudflare platform:

1. **Presentation Layer**: Astro-based front-end with React components deployed on Cloudflare Pages
2. **Business Logic Layer**: Hono API on Cloudflare Workers managing conversation flow and booking logic
3. **AI Integration Layer**: LLM-powered conversation engine using OpenRouter and Vercel AI SDK
4. **Data Layer**: Cloudflare's data services (D1, KV, R2) with Durable Objects for state management

### Architectural Benefits

- **Global Performance**: Edge computing ensures low latency worldwide
- **Scalability**: Serverless architecture scales automatically with demand
- **Reliability**: Distributed infrastructure with built-in redundancy
- **Cost Efficiency**: Pay-per-use model with zero egress fees for R2 storage
- **Developer Experience**: Integrated CI/CD and modern development tools
- **Security**: Built-in DDoS protection and edge security features
- **AI Flexibility**: OpenRouter provides model diversity and fallback capabilities
- **Streaming Performance**: Real-time LLM responses with optimized edge delivery

## LLM Integration Architecture

### AI-Powered Conversation Engine

The application integrates a sophisticated LLM-powered conversation engine that drives natural language interactions while maintaining structured booking flow control.

#### LLM Integration Stack

**OpenRouter Integration**
- **Service**: OpenRouter API as the model interface layer
- **Purpose**: Unified API access to multiple LLM providers with fallback capabilities
- **Configuration**: Environment-based model selection with Gemini 2.5 Flash as default
- **Benefits**: Model flexibility, cost optimization, and provider redundancy

**Vercel AI SDK Framework**
- **Framework**: Vercel AI SDK for streamlined LLM integration
- **Features**: Streaming responses, function calling, structured outputs, conversation memory
- **Integration**: Seamless integration with React components and Cloudflare Workers
- **Benefits**: Type-safe LLM interactions, built-in streaming, and conversation state management

**Gemini 2.5 Flash Model**
- **Default Model**: Google's Gemini 2.5 Flash via OpenRouter
- **Capabilities**: Fast inference, multimodal understanding, function calling, structured outputs
- **Context Window**: 1M+ tokens for comprehensive conversation context
- **Rationale**: Optimal balance of speed, capability, and cost for conversational booking flows

#### LLM Architecture Components

```mermaid
graph TB
    subgraph "LLM Integration Layer"
        A[Conversation Controller] --> B[Prompt Engineering Engine]
        B --> C[OpenRouter Client]
        C --> D[Gemini 2.5 Flash]
        
        A --> E[Function Calling Handler]
        E --> F[Booking Actions]
        E --> G[UI Component Triggers]
        
        A --> H[Context Manager]
        H --> I[Conversation Memory]
        H --> J[Booking State Context]
        H --> K[Customer Data Context]
        
        L[Response Processor] --> A
        L --> M[Structured Output Parser]
        L --> N[UI Component Generator]
    end
```

#### Core LLM Components

**ConversationController**
- **Purpose**: Central orchestrator for LLM-powered conversations
- **Responsibilities**: Message routing, context management, response processing
- **Integration**: Vercel AI SDK with OpenRouter provider configuration
- **Features**: Streaming responses, function calling coordination, conversation state persistence

**PromptEngineeringEngine**
- **Purpose**: Dynamic prompt generation and context injection
- **Responsibilities**: System prompt management, context formatting, conversation history optimization
- **Features**: Role-based prompting, booking flow guidance, brand voice consistency
- **Context Sources**: Customer data, booking state, available options, conversation history

**FunctionCallingHandler**
- **Purpose**: Structured interaction between LLM and booking system
- **Responsibilities**: Function definition, parameter validation, action execution
- **Available Functions**: Hotel selection, tour booking, payment processing, summary generation
- **Integration**: Type-safe function definitions with automatic UI component triggering

**ContextManager**
- **Purpose**: Comprehensive context management for conversation continuity
- **Responsibilities**: Memory persistence, context window optimization, state synchronization
- **Storage**: Durable Objects for conversation state, KV store for customer context
- **Features**: Automatic context pruning, priority-based context retention

### LLM Integration Models

```typescript
interface LLMConfiguration {
  provider: 'openrouter';
  model: 'google/gemini-2.0-flash-exp' | 'anthropic/claude-3-haiku' | 'openai/gpt-4o-mini';
  apiKey: string;
  baseURL: string;
  maxTokens: number;
  temperature: number;
  streamingEnabled: boolean;
}

interface ConversationContext {
  customerId: string;
  bookingData: BookingData;
  conversationHistory: Message[];
  currentStep: BookingStep;
  availableActions: AvailableAction[];
  systemPrompt: string;
  contextWindow: ContextWindow;
}

interface LLMFunction {
  name: string;
  description: string;
  parameters: JSONSchema;
  handler: (params: any) => Promise<FunctionResult>;
}

interface FunctionResult {
  success: boolean;
  data?: any;
  uiComponent?: ComponentDefinition;
  nextStep?: BookingStep;
  error?: string;
}

interface ComponentDefinition {
  type: 'carousel' | 'form' | 'summary' | 'payment';
  props: Record<string, any>;
  data: any;
}
```

### Available LLM Functions

The system provides structured functions that the LLM can call to interact with the booking system:

```typescript
const availableFunctions: LLMFunction[] = [
  {
    name: 'showStopoverCategories',
    description: 'Display stopover category options to the customer',
    parameters: { type: 'object', properties: {} },
    handler: async () => ({
      success: true,
      uiComponent: { type: 'carousel', props: { categories: stopoverCategories } }
    })
  },
  {
    name: 'selectStopoverCategory',
    description: 'Process customer selection of stopover category',
    parameters: {
      type: 'object',
      properties: { categoryId: { type: 'string' } },
      required: ['categoryId']
    },
    handler: async ({ categoryId }) => ({
      success: true,
      nextStep: 'hotel-selection',
      uiComponent: { type: 'carousel', props: { hotels: getHotelsByCategory(categoryId) } }
    })
  },
  {
    name: 'processPayment',
    description: 'Initiate payment process with selected options',
    parameters: {
      type: 'object',
      properties: {
        paymentMethod: { type: 'string', enum: ['credit-card', 'avios'] },
        amount: { type: 'number' }
      },
      required: ['paymentMethod', 'amount']
    },
    handler: async ({ paymentMethod, amount }) => ({
      success: true,
      uiComponent: { type: 'payment', props: { method: paymentMethod, amount } }
    })
  }
];
```

### Prompt Engineering Strategy

**System Prompt Template**
```typescript
const systemPrompt = `
You are a Qatar Airways stopover booking assistant. Your role is to help customers add stopover packages in Doha to their existing flight bookings through natural conversation.

CUSTOMER CONTEXT:
- Name: ${customer.name}
- Booking PNR: ${booking.pnr}
- Route: ${booking.route}
- Passengers: ${booking.passengers}

CONVERSATION GUIDELINES:
1. Maintain Qatar Airways' professional yet friendly tone
2. Guide customers through: category selection → hotel selection → timing/duration → extras → payment
3. Use available functions to display interactive components
4. Always confirm selections before proceeding
5. Provide clear pricing information at each step
6. Handle questions about Doha attractions and logistics

AVAILABLE ACTIONS:
${availableFunctions.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Current conversation step: ${currentStep}
`;
```

**Dynamic Context Injection**
- Real-time booking state integration
- Customer preference learning
- Conversation history summarization
- Available inventory updates

## Components and Interfaces

### Core Chat Interface Components

#### ChatContainer
- **Purpose**: Main container managing the entire chat experience with LLM integration
- **Responsibilities**: Layout management, responsive behavior, modal handling, LLM conversation orchestration
- **Props**: `entryPoint: 'email' | 'mmb'`, `isModal: boolean`, `llmConfig: LLMConfiguration`
- **State**: Current conversation state, UI visibility flags, LLM streaming status
- **LLM Integration**: Vercel AI SDK useChat hook for streaming conversations

#### MessageBubble
- **Purpose**: Individual message rendering for agent and user messages
- **Responsibilities**: Message formatting, rich content rendering, timestamp display
- **Props**: `message: Message`, `sender: 'agent' | 'user'`, `timestamp: Date`
- **Variants**: Text messages, rich content cards, form containers

#### MultiModalInput
- **Purpose**: Unified input interface supporting text, voice, and button interactions with LLM streaming
- **Responsibilities**: Input capture, voice recognition interface, suggested reply rendering, streaming message handling
- **Props**: `onSubmit: (input: UserInput) => void`, `suggestedReplies: string[]`, `isStreaming: boolean`
- **State**: Input text, voice recording status, input method tracking, LLM response streaming
- **LLM Integration**: Real-time streaming display, typing indicators, function call visualization

### Rich Content Components

#### StopoverCategoryCarousel
- **Purpose**: Interactive stopover category selection interface
- **Responsibilities**: Stopover category card rendering, selection handling, responsive layout
- **Props**: `category: CategoryOption[]`, `onSelect: (category: CategoryOption) => void`
- **Features**: Horizontal scrolling on mobile and on desktop

#### HotelCarousel
- **Purpose**: Interactive hotel selection interface
- **Responsibilities**: Hotel card rendering, selection handling, responsive layout
- **Props**: `hotels: HotelOption[]`, `onSelect: (hotel: HotelOption) => void`
- **Features**: Horizontal scrolling on mobile and on desktop

#### StopoverOptions
- **Purpose**: Stopover timing and duration selection interface
- **Responsibilities**: Flight timing selection (outbound/return), duration picker (1-4 nights), validation
- **Props**: `onTimingSelect: (timing: 'outbound' | 'return') => void`, `onDurationSelect: (nights: number) => void`
- **Features**: Radio button groups, duration slider/picker, visual flight timeline

#### StopoverExtras
- **Purpose**: Optional add-ons selection interface including tours and transfers with automatic recommendations
- **Responsibilities**: Transfer option toggle, tours selection management, automatic tour recommendation, pricing updates
- **Props**: `transfers: TransferOption`, `tours: TourOption[]`, `recommendedTour: TourOption`, `onExtrasChange: (extras: SelectedExtras) => void`
- **Features**: Toggle switches, tours carousel integration, featured recommendation display, running total display

#### ToursCarousel
- **Purpose**: Interactive tours selection and basket management
- **Responsibilities**: Tour card rendering, multi-selection handling, quantity management
- **Props**: `tours: TourOption[]`, `selectedTours: SelectedTour[]`, `onToursChange: (tours: SelectedTour[]) => void`
- **Features**: Multi-select cards, quantity controls, horizontal scrolling, basket preview

#### BookingSummary
- **Purpose**: Comprehensive booking review display including all selections and extras
- **Responsibilities**: Summary formatting, pricing calculation, flight routing display, extras breakdown
- **Props**: `booking: BookingDetails`, `pricing: PricingBreakdown`, `stopoverExtras: SelectedExtras`
- **Layout**: Structured sections with clear visual hierarchy, expandable extras section

#### PaymentForm
- **Purpose**: Secure payment interface within chat flow with Privilege Club login and Avios payment options
- **Responsibilities**: Form validation, payment method switching, Privilege Club authentication, Avios balance display, secure input handling
- **Props**: `amount: number`, `aviosOption: boolean`, `onLogin: (credentials: LoginData) => void`, `onSubmit: (payment: PaymentData) => void`
- **Features**: Credit card form, Privilege Club login modal, Avios balance display, payment method tabs
- **Security**: Input masking, validation feedback, secure form practices

### Entry Point Components

#### EmailTemplate
- **Purpose**: Responsive email invitation layout
- **Responsibilities**: Email formatting, CTA button rendering, mobile optimization
- **Props**: `customer: CustomerData`, `booking: BookingData`
- **Features**: Hero image display, personalized content, responsive design

#### MMBPage
- **Purpose**: Simplified Manage My Booking page mockup
- **Responsibilities**: Booking display, floating chat button, page layout
- **Props**: `booking: BookingData`, `customer: CustomerData`
- **Features**: Floating action button, booking card display, responsive header

## Data Models

### Core Data Structures

```typescript
interface CustomerData {
  name: string;
  privilegeClubNumber: string;
  email?: string;
}

interface BookingData {
  pnr: string;
  route: FlightRoute;
  passengers: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface FlightRoute {
  origin: string;
  destination: string;
  stops: string[];
  routing: string;
}

interface StopoverCategory {
  id: string;
  name: string;
  category: 'standard' | 'premium' | 'premium beach' | 'luxury';
  starRating: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}

interface HotelOption {
  id: string;
  name: string;
  category: '4-star' | '5-star' | '5-star deluxe';
  starRating: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}

interface TourOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  highlights: string[];
  maxParticipants: number;
}

interface SelectedTour {
  tour: TourOption;
  quantity: number;
  totalPrice: number;
}

interface TransferOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'airport-transfer';
}

interface SelectedExtras {
  transfers?: TransferOption;
  tours: SelectedTour[];
  totalExtrasPrice: number;
}

interface StopoverSelection {
  timing: 'outbound' | 'return';
  duration: number;
  stopovertype: StopoverCategory;
  hotel: HotelOption;
  extras: SelectedExtras;
}

interface AddOnOption {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'transfer' | 'tour' | 'experience';
}

interface BookingState {
  customer: CustomerData;
  originalBooking: BookingData;
  stopoverSelection?: StopoverSelection;
  pricing?: PricingBreakdown;
  paymentStatus: 'pending' | 'processing' | 'completed';
}

interface ConversationState {
  messages: Message[];
  currentStep: ConversationStep;
  awaitingInput: boolean;
  suggestedReplies: string[];
  llmState: LLMConversationState;
}

interface LLMConversationState {
  isStreaming: boolean;
  currentModel: string;
  conversationId: string;
  contextWindow: Message[];
  functionCallsAvailable: LLMFunction[];
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}
```

### Message and Interaction Models

```typescript
interface Message {
  id: string;
  sender: 'agent' | 'user';
  content: MessageContent;
  timestamp: Date;
  metadata?: MessageMetadata;
  llmMetadata?: LLMMessageMetadata;
}

interface MessageContent {
  type: 'text' | 'rich' | 'form' | 'summary' | 'streaming';
  text?: string;
  richContent?: RichContent;
  formData?: FormContent;
  streamingContent?: StreamingContent;
}

interface LLMMessageMetadata {
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  functionCalls?: FunctionCall[];
  streamingComplete: boolean;
  processingTime: number;
}

interface StreamingContent {
  partialText: string;
  isComplete: boolean;
  functionCallsInProgress: FunctionCall[];
}

interface FunctionCall {
  name: string;
  parameters: Record<string, any>;
  result?: FunctionResult;
  status: 'pending' | 'executing' | 'completed' | 'error';
}

interface UserInput {
  type: 'text' | 'voice' | 'button';
  content: string;
  metadata?: InputMetadata;
  conversationContext?: ConversationContext;
}
```

### Authentication and Payment Models

```typescript
interface LoginData {
  email: string;
  password: string;
}

interface PrivilegeClubAccount {
  memberId: string;
  memberName: string;
  tierStatus: 'Silver' | 'Gold' | 'Platinum';
  aviosBalance: number;
  isLoggedIn: boolean;
}

interface PaymentData {
  method: 'credit-card' | 'avios';
  creditCard?: CreditCardData;
  aviosRedemption?: AviosPaymentData;
}

interface CreditCardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

interface AviosPaymentData {
  aviosUsed: number;
  remainingBalance: number;
  conversionRate: number; // 125 Avios per $1
}

interface PricingBreakdown {
  hotelCost: number;
  flightFareDifference: number;
  transfersCost: number;
  toursCost: number;
  totalCashPrice: number;
  totalAviosPrice: number;
}
```

### Tour Recommendation Models

```typescript
interface RecommendedTour extends TourOption {
  isRecommended: boolean;
  recommendationReason: string;
  availabilityStatus: 'available' | 'limited' | 'unavailable';
  matchScore: number; // 0-100 based on stopover dates and preferences
}
```

## Error Handling

### Input Validation Strategy

1. **Real-time Validation**: Form inputs validated on blur with immediate feedback
2. **Voice Input Fallback**: Text input available when voice recognition fails
3. **Network Simulation**: Graceful handling of simulated network delays
4. **Data Consistency**: Validation of booking data integrity throughout flow
5. **LLM Response Validation**: Function call parameter validation and response sanitization
6. **Model Fallback**: Automatic fallback to alternative models via OpenRouter on failures

### Error Recovery Patterns

- **Invalid Input**: Clear error messages with suggested corrections
- **Voice Recognition Failure**: Automatic fallback to text input with user notification
- **Form Validation Errors**: Inline error display with field-specific guidance
- **State Corruption**: Automatic state recovery with conversation restart option
- **LLM API Failures**: Model fallback chain (Gemini 2.5 Flash → Claude 3 Haiku → GPT-4o Mini)
- **Function Call Errors**: Graceful error handling with conversational recovery
- **Streaming Interruptions**: Resume capability and partial response handling

### User Feedback Mechanisms

```typescript
interface ErrorState {
  type: 'validation' | 'system' | 'network' | 'llm' | 'function-call';
  message: string;
  recoveryAction?: string;
  retryable: boolean;
  llmError?: LLMErrorDetails;
}

interface LLMErrorDetails {
  model: string;
  errorType: 'rate-limit' | 'context-length' | 'api-error' | 'timeout' | 'invalid-response';
  fallbackModel?: string;
  retryAttempt: number;
  maxRetries: number;
}

interface LoadingState {
  isLoading: boolean;
  operation: string;
  progress?: number;
}
```

## LLM Implementation Configuration

### Environment Setup

**Required Environment Variables**
```bash
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Model Configuration
DEFAULT_MODEL=google/gemini-2.0-flash-exp
FALLBACK_MODELS=anthropic/claude-3-haiku,openai/gpt-4o-mini
MAX_TOKENS=4096
TEMPERATURE=0.7

# Conversation Configuration
MAX_CONTEXT_MESSAGES=20
CONTEXT_WINDOW_TOKENS=100000
FUNCTION_CALLING_ENABLED=true
STREAMING_ENABLED=true
```

**Package Dependencies**
```json
{
  "dependencies": {
    "@vercel/ai": "^3.0.0",
    "openai": "^4.0.0",
    "zod": "^3.22.0"
  }
}
```

### LLM Service Implementation

**OpenRouter Client Configuration**
```typescript
import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const llmConfig = {
  model: openrouter(process.env.DEFAULT_MODEL || 'google/gemini-2.0-flash-exp'),
  fallbackModels: [
    openrouter('anthropic/claude-3-haiku'),
    openrouter('openai/gpt-4o-mini')
  ],
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
};
```

**Conversation API Endpoint**
```typescript
// /api/chat/route.ts
import { streamText } from 'ai';
import { llmConfig } from '@/lib/llm-config';
import { bookingFunctions } from '@/lib/booking-functions';

export async function POST(req: Request) {
  const { messages, conversationContext } = await req.json();
  
  const result = await streamText({
    model: llmConfig.model,
    messages,
    tools: bookingFunctions,
    system: generateSystemPrompt(conversationContext),
    maxTokens: llmConfig.maxTokens,
    temperature: llmConfig.temperature,
  });
  
  return result.toAIStreamResponse();
}
```

### Function Calling Implementation

**Booking Functions Definition**
```typescript
import { z } from 'zod';
import { tool } from 'ai';

export const bookingFunctions = {
  showStopoverCategories: tool({
    description: 'Display available stopover categories to the customer',
    parameters: z.object({}),
    execute: async () => {
      return {
        categories: stopoverCategories,
        uiComponent: 'StopoverCategoryCarousel'
      };
    }
  }),
  
  selectHotel: tool({
    description: 'Process hotel selection and move to next step',
    parameters: z.object({
      hotelId: z.string(),
      categoryId: z.string()
    }),
    execute: async ({ hotelId, categoryId }) => {
      const hotel = await getHotelById(hotelId);
      return {
        selectedHotel: hotel,
        nextStep: 'timing-selection',
        uiComponent: 'StopoverOptions'
      };
    }
  }),
  
  processPayment: tool({
    description: 'Initialize payment process',
    parameters: z.object({
      paymentMethod: z.enum(['credit-card', 'avios']),
      totalAmount: z.number()
    }),
    execute: async ({ paymentMethod, totalAmount }) => {
      return {
        paymentInitialized: true,
        uiComponent: 'PaymentForm',
        paymentData: { method: paymentMethod, amount: totalAmount }
      };
    }
  })
};
```

## Testing Strategy

### Component Testing Approach

1. **Unit Tests**: Individual component functionality and prop handling
2. **Integration Tests**: Component interaction and state management
3. **Visual Regression Tests**: Design system compliance and responsive behavior
4. **Accessibility Tests**: WCAG compliance and keyboard navigation
5. **LLM Integration Tests**: Function calling, streaming responses, and model fallbacks
6. **Conversation Flow Tests**: Multi-turn conversation handling and context management

### User Flow Testing

1. **End-to-End Tests**: Complete user journeys from entry to confirmation
2. **Cross-Device Testing**: Responsive behavior across device types
3. **Multi-Modal Input Testing**: Text, voice, and button interaction validation
4. **State Persistence Testing**: Conversation state management across interactions
5. **LLM Response Testing**: Function call accuracy, response quality, and error handling
6. **Model Fallback Testing**: Automatic model switching and graceful degradation

### Test Data Management

```typescript
interface TestScenarios {
  happyPath: UserFlowTest;
  errorHandling: ErrorScenarioTest[];
  edgeCases: EdgeCaseTest[];
  accessibility: AccessibilityTest[];
  performance: PerformanceTest[];
  llmScenarios: LLMTestScenarios;
}

interface LLMTestScenarios {
  conversationFlows: ConversationTest[];
  functionCalling: FunctionCallTest[];
  modelFallbacks: ModelFallbackTest[];
  streamingTests: StreamingTest[];
  contextManagement: ContextTest[];
}

interface ConversationTest {
  name: string;
  userInputs: string[];
  expectedFunctionCalls: string[];
  expectedUIComponents: string[];
  conversationContext: ConversationContext;
}
```

### Performance Testing

- **Load Time Metrics**: Initial page load and component rendering times
- **Interaction Responsiveness**: Input handling and state update performance
- **Memory Usage**: Component lifecycle and state management efficiency
- **Mobile Performance**: Touch interaction responsiveness and battery impact

## Responsive Design Strategy

### Breakpoint System

```css
/* Mobile First Approach */
:root {
  --mobile: 320px;
  --tablet: 768px;
  --desktop: 1024px;
  --large-desktop: 1440px;
}
```

### Layout Adaptations

1. **Chat Interface**: Full-screen on mobile, centered modal on desktop
2. **Stopover Category Carousel**: Horizontal scroll on mobile and on desktop
3. **Hotel Carousel**: Horizontal scroll on mobile and on desktop
4. **Input Interface**: Bottom-fixed on mobile, inline on desktop
5. **Navigation**: Hamburger menu on mobile, full navigation on desktop

### Touch and Interaction Design

- **Touch Targets**: Minimum 44px for all interactive elements
- **Gesture Support**: Swipe navigation for hotel carousel
- **Voice Input**: Large, accessible microphone button
- **Keyboard Navigation**: Full keyboard accessibility for all interactions

## Design System Integration

### Qatar Airways Digital Design System

The application strictly adheres to the Qatar Airways Digital Design System v1.0.0, ensuring brand consistency and visual coherence across all components and interactions.

#### Color Palette Implementation

**Primary Colors:**
- **Burgundy (#662046)**: Primary brand color for main CTAs, headlines, and key brand elements
- **Oneworld Blue (#120C80)**: Secondary color for alliance branding elements

**Neutral Colors:**
- **Grey Scale**: Light grey (#818A8F), medium grey (#5E6A71), dark grey (#8E8F8B)
- **Background Colors**: Light grey (#F5F5F7) for containers, white (#FFFFFF) for primary backgrounds
- **Text Colors**: Black (#000000) for primary text, grey variants for secondary text

**Accent Colors:**
- **Alert Red (#D0021B)**: For special offers, alerts, and discounted prices

#### Typography System

**Font Family**: Primary font "Jotia" with Arial fallback
**Base Font Size**: 16px with responsive scaling

**Typography Hierarchy:**
- **H1**: 2.5rem, 700 weight, burgundy color for main headings
- **H2**: 2rem, 500 weight, grey2 color for section headings  
- **H3**: 1.5rem, 500 weight, grey2 color for subsection headings
- **Body Text**: 1rem, 400 weight, grey2 color with 1.6 line height
- **Links**: 1rem, 500 weight, burgundy color with hover underline

#### Spacing and Layout System

**Base Unit**: 8px spacing system
**Spacing Scale**: XS(4px), SM(8px), MD(16px), LG(24px), XL(32px), XXL(48px)
**Container**: Max-width 1280px with auto margins and LG padding

#### Component Design Specifications

**Buttons:**
- **Primary**: Burgundy background, white text, 12px/24px padding, 8px border radius
- **Secondary**: White background, burgundy text and border, hover state with light background
- **Ghost**: Transparent background, grey text, light grey hover state

**Cards:**
- White background, 16px border radius, medium shadow, 24px padding
- Used for hotel selections, tour options, and booking summaries

**Input Fields:**
- White background, grey border, 8px border radius, 12px/16px padding
- Focus state with burgundy border and subtle shadow
- Form validation with inline error messaging

**Tabs:**
- Horizontal layout with bottom border separator
- Active tab: burgundy color, 500 weight, burgundy bottom border
- Inactive tabs: grey color with transparent border

### Component Styling Architecture

```typescript
interface QatarDesignTokens {
  colors: {
    primary: { burgundy: '#662046' };
    secondary: { oneworldBlue: '#120C80' };
    neutral: {
      grey1: '#818A8F';
      grey2: '#5E6A71'; 
      grey3: '#8E8F8B';
      lightGrey: '#F5F5F7';
      white: '#FFFFFF';
      black: '#000000';
    };
    accent: { red: '#D0021B' };
  };
  typography: {
    fontFamily: 'Jotia, Arial, sans-serif';
    baseFontSize: '16px';
    headings: { h1: '2.5rem', h2: '2rem', h3: '1.5rem' };
  };
  spacing: {
    baseUnit: '8px';
    scale: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' };
  };
  borderRadius: { sm: '4px', md: '8px', lg: '16px', full: '9999px' };
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  };
}
```

### Brand Consistency Implementation

1. **Color Usage**: Burgundy primary for all CTAs and key interactions, grey scale for text hierarchy
2. **Typography**: Jotia font family with systematic size and weight scale
3. **Spacing**: 8px base unit system ensuring consistent visual rhythm
4. **Component Variants**: Standardized button, card, input, and tab components following design system specifications
5. **Interactive States**: Consistent hover, focus, and active states across all components
6. **Accessibility**: WCAG-compliant color contrast ratios and focus indicators

### Design System Reference

The complete design system specification is maintained in `.kiro/specs/qatar-stopover-ai-agent/design_system.json` and serves as the single source of truth for all visual design decisions, component styling, and brand consistency requirements.

The design ensures strict adherence to the Qatar Airways design system while providing a modern, intuitive user experience that scales across devices and interaction methods.