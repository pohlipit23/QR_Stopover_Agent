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

- [ ] 2. Implement comprehensive TypeScript data models and interfaces
  - Create core data interfaces (CustomerData, BookingData, FlightRoute, ConversationState)
  - Implement stopover-specific models (StopoverCategory, HotelOption, TourOption, SelectedExtras)
  - Add authentication models (LoginData, PrivilegeClubAccount, PaymentData)
  - Create message and interaction models (Message, MessageContent, UserInput)
  - Implement pricing and booking state models (PricingBreakdown, BookingState)
  - Add tour recommendation models (RecommendedTour with match scoring)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 3. Create static data layer with comprehensive sample data
  - Implement customer data (Alex Johnson, PNR X4HG8, Privilege Club QR12345678)
  - Create hotel data with detailed amenities and pricing for five premium hotels using provided hotel images
  - Add stopover category data with star ratings and comprehensive pricing structure using provided category images
  - Implement tour data including "Whale Sharks of Qatar" with recommendation logic using provided tour images
  - Create transfer options data and pricing calculation utilities
  - Add mock Privilege Club account data with Avios balance (15,000 Avios)
  - Reference provided images in all data structures (hotel images, category images, tour images)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 4. Create Qatar Airways design system foundation
  - Create design_system.json file with comprehensive Qatar Airways design tokens
  - Implement Jotia font family with Arial fallback and typography hierarchy
  - Configure Tailwind CSS with Qatar Airways color palette (burgundy #662046, oneworld blue #120C80)
  - Set up 8px base spacing system and responsive breakpoint configuration
  - Create component styling utilities for buttons, cards, inputs, and tabs
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 5. Create entry point components
- [ ] 5.1 Implement EmailTemplate component
  - Build responsive email layout with Qatar Airways branding and Jotia typography
  - Use provided Qatar Airways logo and hero image of Doha for personalized content display
  - Implement "Build My Stopover" call-to-action button with burgundy primary styling
  - Integrate provided brand assets throughout the email template design
  - _Requirements: 1.1, 1.2, 12.1, 12.5_

- [ ] 5.2 Implement MMBPage component
  - Create simplified Manage My Booking page layout with Qatar Airways design system
  - Use provided Qatar Airways logo in header and maintain consistent branding
  - Display booking details card with PNR X4HG8 and LHR-BKK routing
  - Add floating chat button with proper positioning and responsive behavior
  - _Requirements: 1.3, 1.4, 11.4_

- [ ] 6. Build core chat interface components
- [ ] 6.1 Implement ChatContainer component
  - Create main chat interface layout with responsive design and Qatar Airways styling
  - Handle modal overlay functionality for MMB entry point with proper z-index management
  - Implement conversation state management and message flow with error boundaries
  - Add loading states and conversation persistence across interactions
  - _Requirements: 2.1, 11.1, 11.2_

- [ ] 6.2 Implement MessageBubble component
  - Create agent and user message bubble styling with Qatar Airways brand colors
  - Support rich content rendering for cards, forms, and interactive elements
  - Add timestamp display with proper message alignment and spacing
  - Implement message metadata handling and delivery status indicators
  - _Requirements: 12.3, 2.3_

- [ ] 6.3 Implement MultiModalInput component
  - Build unified input interface with text field, voice button, and suggested reply chips
  - Add voice input visual indicators and recording state management
  - Implement suggested reply button rendering with Qatar Airways button styling
  - Handle input validation and multi-modal interaction switching
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7. Create stopover category selection interface
  - Implement StopoverCategoryCarousel component with four category cards
  - Use provided stopover category images for each category (Standard, Premium, Premium Beach, Luxury)
  - Add horizontal scrolling for mobile and grid layout for desktop
  - Include category images, names, star ratings, pricing, and select buttons
  - Handle category selection and progression to hotel selection
  - _Requirements: 3.2, 3.3, 3.4, 11.3_

- [ ] 8. Build hotel selection interface
  - Implement HotelCarousel component with five premium hotel cards
  - Use provided hotel images for each hotel (Millennium, Steigenberger, Souq Waqif, Crowne Plaza, Al Najada)
  - Display hotel images, names, star ratings, amenities, and select buttons
  - Add responsive carousel behavior with horizontal scrolling
  - Handle hotel selection and progression to timing/duration selection
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 11.3_

- [ ] 9. Create timing and duration selection interface
  - Implement StopoverOptions component with radio buttons for outbound/return timing
  - Add duration picker for 1-4 nights with pricing implications display
  - Create visual flight timeline showing stopover placement
  - Handle timing and duration selection validation and progression
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 10. Implement extras selection with automatic recommendations
- [ ] 10.1 Build StopoverExtras component
  - Create interface for transfer toggle ($60 return) and tour selection
  - Implement automatic "Whale Sharks of Qatar" tour recommendation using provided tour images
  - Add "Recommended for your dates" highlighting and one-click addition with special visual treatment
  - Display running total of selected extras with real-time pricing updates
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.5_

- [ ] 10.2 Build ToursCarousel component
  - Create tour cards with multi-selection capability and quantity controls using provided tour images
  - Implement horizontal scrolling carousel with tour basket preview
  - Handle multiple tour selection and quantity management
  - Update tour basket and pricing calculations
  - Use provided tour images for all tour options including "Whale Sharks of Qatar"
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 11. Create comprehensive booking summary
  - Implement BookingSummary component with all selection details
  - Display updated flight routing (LHR → DOH (stay) → BKK → DOH → LHR)
  - Calculate and show flight fare difference ($115), hotel costs, extras costs, and total
  - Add Avios conversion display (125 Avios per $1) and "Proceed to Payment" button
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Implement secure payment processing
- [ ] 12.1 Build PaymentForm component with credit card support
  - Create secure payment form with card number, expiry, CVV, and name fields
  - Implement input masking, validation feedback, and secure form practices
  - Add payment method tabs for credit card and Avios options
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 12.2 Add Privilege Club login and Avios payment
  - Implement "Login to Privilege Club" option with login form using provided Privilege Club logo
  - Create mock authentication flow with username/email and password fields
  - Display mock Avios balance (15,000 Avios) and redemption calculations
  - Handle Avios payment processing with remaining balance display
  - Integrate provided Privilege Club branding and logo throughout the authentication flow
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 9.4_

- [ ] 12.3 Implement payment confirmation
  - Create confirmation display with new PNR (X9FG1) and booking details
  - Show payment success message and booking summary
  - Handle both credit card and Avios payment confirmations
  - _Requirements: 9.5_

- [ ] 13. Implement conversation flow management
  - Create conversation engine to handle step-by-step user flow
  - Implement welcome message with customer name and booking reference
  - Add flow controller to manage progression between selection steps
  - Handle conversation state persistence and error recovery
  - _Requirements: 3.1, 2.4_

- [ ] 14. Implement Cloudflare Workers API with Hono framework
  - Create Hono API routes for conversation management and booking operations
  - Implement API endpoints for customer data, hotel selection, and pricing calculations
  - Set up Cloudflare Workers deployment configuration and environment variables
  - Create API middleware for request validation and error handling
  - Implement mock authentication endpoints for Privilege Club login
  - _Requirements: 2.1, 3.1, 9.1, 10.1_

- [ ] 15. Set up Cloudflare data services integration
  - Configure Cloudflare KV store for configuration and cached data
  - Set up Cloudflare R2 storage for images and static assets including provided brand assets
  - Upload provided images to R2 storage (Qatar Airways logo, Privilege Club logo, hotel images, category images, tour images)
  - Implement Durable Objects for conversation state management
  - Create data access patterns for booking session coordination
  - Add error handling and fallback mechanisms for data services
  - _Requirements: 2.4, 3.1, 8.1_

- [ ] 16. Add responsive design and accessibility features
  - Implement mobile-first responsive design across all components
  - Ensure touch targets meet 44px minimum accessibility standards
  - Add keyboard navigation support for all interactive elements
  - Test and optimize touch interactions and gesture support
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 17. Create comprehensive testing suite
  - Write unit tests for all components with prop validation and interaction testing
  - Implement integration tests for complete user flow from entry to confirmation
  - Add visual regression tests for design system compliance
  - Create accessibility tests for WCAG compliance and keyboard navigation
  - Test API endpoints and Cloudflare Workers functionality
  - _Requirements: All requirements validation_

- [ ] 18. Optimize performance and finalize application
  - Implement lazy loading for images and optimize component rendering
  - Add error boundaries and graceful error handling throughout the application
  - Test cross-device compatibility and optimize mobile performance
  - Conduct final end-to-end testing of complete user journeys
  - Optimize Cloudflare edge performance and caching strategies
  - _Requirements: 11.1, 11.2, 11.5_