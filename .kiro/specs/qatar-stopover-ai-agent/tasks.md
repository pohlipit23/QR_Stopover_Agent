# Implementation Plan

- [x] 1. Set up Astro project structure with Cloudflare Pages architecture
  - Create Astro project with React integration and TypeScript support
  - Configure Cloudflare Pages deployment with astro.config.mjs
  - Install required dependencies (Astro, React, TypeScript, Tailwind CSS, Hono for API)
  - Set up directory structure: src/components/, src/types/, src/data/, src/utils/, src/pages/, src/assets/images/
  - Create project configuration files (package.json, tsconfig.json, astro.config.mjs)
  - Configure Tailwind CSS with Qatar Airways design tokens integration
  - Set up assets directory structure for provided images (logos, hotel images, category images, tour images)
  - _Requirements: 1.1, 12.1, 13.1_

- [x] 2. Implement comprehensive TypeScript data models and interfaces
  - Create core data interfaces (CustomerData, BookingData, FlightRoute, ConversationState)
  - Implement stopover-specific models (StopoverCategory, HotelOption, TourOption, SelectedExtras)
  - Add authentication models (LoginData, PrivilegeClubAccount, PaymentData)
  - Create message and interaction models (Message, MessageContent, UserInput)
  - Implement pricing and booking state models (PricingBreakdown, BookingState)
  - Add tour recommendation models (RecommendedTour with match scoring)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 3. Create static data layer with comprehensive sample data
  - Implement customer data (Alex Johnson, PNR X4HG8, Privilege Club QR12345678)
  - Create hotel data with detailed amenities and pricing for five premium hotels using provided hotel images
  - Add stopover category data with star ratings and comprehensive pricing structure using provided category images
  - Implement tour data including "Whale Sharks of Qatar" with recommendation logic using provided tour images
  - Create transfer options data and pricing calculation utilities
  - Add mock Privilege Club account data with Avios balance (275,000 Avios)
  - Reference provided images in all data structures (hotel images, category images, tour images)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 4. Create Qatar Airways design system foundation
  - Create design_system.json file with comprehensive Qatar Airways design tokens
  - Implement Jotia font family with Arial fallback and typography hierarchy
  - Configure Tailwind CSS with Qatar Airways color palette (burgundy #662046, oneworld blue #120C80)
  - Set up 8px base spacing system and responsive breakpoint configuration
  - Create component styling utilities for buttons, cards, inputs, and tabs
  - Create design system utilities and validation functions
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 5. Create entry point components




- [x] 5.1 Implement EmailTemplate component





  - Build responsive email layout with Qatar Airways branding and Jotia typography
  - Use provided Qatar Airways logo and hero image of Doha for personalized content display
  - Implement "Build My Stopover" call-to-action button with burgundy primary styling
  - Integrate provided brand assets throughout the email template design
  - _Requirements: 1.1, 1.2, 12.1, 12.5_

- [x] 5.2 Implement MMBPage component


  - Create simplified Manage My Booking page layout with Qatar Airways design system
  - Use provided Qatar Airways logo in header and maintain consistent branding
  - Display booking details card with PNR X4HG8 and LHR-BKK routing
  - Add floating chat button with proper positioning and responsive behavior
  - _Requirements: 1.3, 1.4, 11.4_

- [x] 6. Build core chat interface components


- [x] 6.1 Implement ChatContainer component






  - Create main chat interface layout with responsive design and Qatar Airways styling
  - Handle modal overlay functionality for MMB entry point with proper z-index management
  - Implement conversation state management and message flow with error boundaries
  - Add loading states and conversation persistence across interactions
  - _Requirements: 2.1, 11.1, 11.2_

- [x] 6.2 Implement MessageBubble component

  - Create agent and user message bubble styling with Qatar Airways brand colors
  - Support rich content rendering for cards, forms, and interactive elements
  - Add timestamp display with proper message alignment and spacing
  - Implement message metadata handling and delivery status indicators
  - Add trigger functionality to ChatContainer from email-template.astro "Build My Stopover" button
  - _Requirements: 12.3, 2.3, 1.1, 1.2_

- [x] 6.3 Implement MultiModalInput component







  - Build unified input interface with text field, voice button, and suggested reply chips
  - Add voice input only as a visual indicator but don't implement the functionality during this phase. 
  - Handle input validation and multi-modal interaction switching
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 7. Create rich content components for LLM integration





- [x] 7.1 Implement StopoverCategoryCarousel component


  - Create component with four category cards (Standard, Premium, Premium Beach, Luxury)
  - Use provided stopover category images for each category
  - Add horizontal scrolling for mobile and grid layout for desktop
  - Include category images, names, star ratings, pricing, and select buttons
  - Handle category selection and trigger LLM function calls
  - Integrate with MessageBubble rich content rendering system
  - _Requirements: 3.2, 3.3, 3.4, 11.3_

- [x] 7.2 Implement HotelCarousel component


  - Create component with five premium hotel cards
  - Use provided hotel images for each hotel (Millennium, Steigenberger, Souq Waqif, Crowne Plaza, Al Najada)
  - Display hotel images, names, star ratings, amenities, and select buttons
  - Add responsive carousel behavior with horizontal scrolling
  - Handle hotel selection and trigger LLM function calls for next step
  - Integrate with MessageBubble rich content rendering system
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 11.3_

- [x] 7.3 Implement StopoverOptions component


  - Create component with radio buttons for outbound/return timing
  - Add duration picker for 1-4 nights with pricing implications display
  - Create visual flight timeline showing stopover placement
  - Handle timing and duration selection validation and LLM function calls
  - Integrate with MessageBubble rich content rendering system
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7.4 Build StopoverExtras component


  - Create interface for transfer toggle ($60 return) and tour selection
  - Implement automatic "Whale Sharks of Qatar" tour recommendation using provided tour images
  - Add "Recommended for your dates" highlighting and one-click addition with special visual treatment
  - Display running total of selected extras with real-time pricing updates
  - Handle extras selection and trigger LLM function calls for booking summary
  - Integrate with MessageBubble rich content rendering system
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.5_

- [x] 7.5 Build ToursCarousel component


  - Create tour cards with multi-selection capability and quantity controls using provided tour images
  - Implement horizontal scrolling carousel with tour basket preview
  - Handle multiple tour selection and quantity management
  - Update tour basket and pricing calculations
  - Use provided tour images for all tour options including "Whale Sharks of Qatar"
  - Integrate with StopoverExtras component and LLM function calls
  - _Requirements: 7.2, 7.3, 7.4_

- [x] 8. Create booking summary and payment components (Note: These are handled by generic summary and form renderers in MessageBubble, driven by LLM function calls)
- [x] 8.1 Booking summary functionality implemented via LLM function calls
  - LLM selectExtras function generates booking summary with all selection details
  - Displays updated flight routing, costs breakdown, and total pricing
  - Includes Avios conversion display (125 Avios per $1) and payment options
  - Integrates with MessageBubble summary renderer for display
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8.2 Payment form functionality implemented via LLM function calls
  - LLM initiatePayment function generates secure payment forms
  - Supports both credit card and Avios payment methods
  - Includes proper field validation and form structure
  - Integrates with MessageBubble form renderer for display
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 8.3 Privilege Club login and Avios payment implemented via LLM function calls
  - LLM initiatePayment function handles Privilege Club authentication flow
  - Generates appropriate login forms with username/email and password fields
  - Mock Avios balance and redemption calculations handled in function logic
  - Privilege Club branding integrated through form renderer
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 9.4_

- [x] 8.4 Payment confirmation implemented via LLM function calls
  - LLM completeBooking function generates confirmation display
  - Shows new PNR (X9FG1) and booking details via summary renderer
  - Handles both credit card and Avios payment confirmations
  - Complete booking process managed through LLM function calls
  - _Requirements: 9.5_

- [ ] 8.5 Enhance form and summary renderers for payment and booking flows
  - Add input masking for credit card numbers and expiry dates in FormRenderer
  - Implement payment method tabs (credit card vs Avios) in FormRenderer
  - Add Privilege Club logo and branding to Avios payment forms
  - Enhance summary renderer with flight routing visualization
  - Add proper styling for booking confirmation summaries
  - Implement form validation feedback and error handling
  - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 8.1, 8.2_

- [x] 13. Implement LLM conversation flow management
- [x] 13.1 Create LLM function calling system

  - Define booking functions for LLM integration (showStopoverCategories, selectHotel, processPayment, etc.)
  - Implement function parameter validation using Zod schemas
  - Create function execution handlers that trigger UI component rendering
  - Add function call result processing and UI state updates
  - _Requirements: 3.1, 2.4_

- [x] 13.2 Implement conversation flow controller with LLM integration

  - Create conversation engine that orchestrates LLM responses with UI components
  - Implement system prompt generation with customer context and booking state
  - Add conversation memory management and context window optimization
  - Handle LLM streaming responses and function call coordination
  - Integrate all rich content components through LLM function calls
  - _Requirements: 3.1, 2.4_

- [x] 6.4 Install LLM integration dependencies

  - Add Vercel AI SDK (@ai-sdk/openai, ai) to package.json
  - Add Zod for function parameter validation
  - Configure OpenRouter client for Gemini 2.5 Flash model access
  - Set up environment variables for API keys and model configuration
  - _Requirements: 2.1, 2.4_

- [x] 6.5 Implement LLM conversation API endpoint

  - Create /api/chat route using Hono framework
  - Implement streaming text generation with OpenRouter/Gemini integration
  - Add conversation context management and system prompt generation
  - Handle function calling for booking actions
  - Add error handling and model fallback capabilities
  - _Requirements: 2.1, 2.4, 3.1_

- [x] 6.6 Integrate LLM streaming into ChatContainer

  - Replace mock conversation logic with real LLM API calls
  - Implement streaming message display with typing indicators
  - Add function call result processing and UI component triggering
  - Handle conversation state synchronization with LLM responses
  - Add error recovery and retry mechanisms for LLM failures
  - _Requirements: 2.1, 2.4, 3.1_

- [ ] 6.7 Configure environment variables for LLM integration
  - Create .env file with OPENROUTER_API_KEY configuration
  - Set DEFAULT_MODEL to google/gemini-2.0-flash-exp
  - Configure fallback models (anthropic/claude-3-haiku, openai/gpt-4o-mini)
  - Set MAX_TOKENS, TEMPERATURE, and STREAMING_ENABLED variables
  - Test LLM integration with proper API key configuration
  - _Requirements: 2.1, 2.4, 3.1_

- [ ] 6.8 Fix TypeScript errors in LLM integration
  - Fix type errors in booking-functions.ts parameter destructuring
  - Update API endpoint to use correct AI SDK methods (toTextStreamResponse)
  - Fix ChatContainer type errors for useChat hook
  - Add proper type annotations for LLM function parameters
  - Resolve ErrorState type compatibility issues
  - _Requirements: 2.1, 2.4, 3.1_

- [ ] 6.9 Test end-to-end LLM conversation flow
  - Test complete conversation flow from welcome to booking confirmation
  - Verify all function calls trigger appropriate UI components
  - Test error handling and model fallback scenarios
  - Validate streaming responses and typing indicators
  - Test conversation persistence and context management
  - _Requirements: 2.1, 2.4, 3.1, All user stories_



- [ ] 9. Set up Cloudflare deployment and data services
- [ ] 9.1 Configure Cloudflare Pages deployment
  - Set up Cloudflare Pages deployment configuration in astro.config.mjs
  - Configure environment variables for LLM API keys and model settings
  - Set up build and deployment pipeline with proper asset handling
  - _Requirements: 2.1, 3.1_

- [ ] 9.2 Set up Cloudflare data services integration
  - Configure Cloudflare KV store for configuration and cached data
  - Set up Cloudflare R2 storage for images and static assets including provided brand assets
  - Upload provided images to R2 storage (Qatar Airways logo, Privilege Club logo, hotel images, category images, tour images)
  - Implement Durable Objects for conversation state management
  - Create data access patterns for booking session coordination
  - Add error handling and fallback mechanisms for data services
  - _Requirements: 2.4, 3.1, 8.1_

- [ ] 10. Add responsive design and accessibility features
  - Implement mobile-first responsive design across all rich content components
  - Ensure touch targets meet 44px minimum accessibility standards
  - Add keyboard navigation support for all interactive elements
  - Test and optimize touch interactions and gesture support for carousels and forms
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 11. Create comprehensive testing suite
- [ ] 11.1 Set up testing infrastructure
  - Install Jest and React Testing Library dependencies
  - Configure Jest for TypeScript and React components
  - Set up test environment with proper mocks for browser APIs
  - Add test scripts to package.json
  - Fix existing MultiModalInput test file type errors
  - _Requirements: All requirements validation_

- [ ] 11.2 Write component unit tests
  - Write unit tests for all components with prop validation and interaction testing
  - Test ChatContainer LLM integration and message handling
  - Test rich content components (carousels, forms, summaries)
  - Add accessibility tests for WCAG compliance and keyboard navigation
  - _Requirements: All requirements validation_

- [ ] 11.3 Write integration tests
  - Implement integration tests for LLM conversation flow and function calling
  - Test API endpoints and error handling
  - Add visual regression tests for design system compliance
  - Test complete user journeys from entry points to booking confirmation
  - _Requirements: All requirements validation_

- [ ] 12. Optimize performance and finalize application
  - Implement lazy loading for images and optimize component rendering
  - Add error boundaries and graceful error handling throughout the application
  - Test cross-device compatibility and optimize mobile performance
  - Conduct final end-to-end testing of complete LLM-powered user journeys
  - Optimize Cloudflare edge performance and caching strategies
  - Test LLM response times and implement performance monitoring
  - _Requirements: 11.1, 11.2, 11.5_