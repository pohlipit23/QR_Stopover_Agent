# Requirements Document

## Introduction

The Qatar Airways Stopover AI Agent is a high-fidelity, interactive web application that enables existing Qatar Airways customers to add stopover packages in Doha to their flight itineraries through a conversational AI interface. The application provides a modern, LLM-style chat experience with multi-modal input capabilities (text, voice, and button interactions) and must be fully responsive across desktop and mobile devices. The system operates as a mockup with static sample data, requiring no backend integration while maintaining a realistic user experience that strictly adheres to Qatar Airways' design system.

## Requirements

### Requirement 1

**User Story:** As an existing Qatar Airways customer, I want to access the stopover booking experience through multiple entry points, so that I can easily discover and add stopovers to my existing bookings.

#### Acceptance Criteria

1. WHEN a customer receives an email invitation THEN the system SHALL display a mobile-responsive email layout with Qatar Airways branding
2. WHEN the email is displayed THEN the system SHALL include a hero image of Doha, personalized content with customer name and PNR, and a prominent "Build My Stopover" call-to-action button
3. WHEN a customer accesses the Manage My Booking page THEN the system SHALL display their booking details (PNR: X4HG8, LHR-BKK route, 2 adults) with a floating chat button
4. WHEN the floating chat button is clicked THEN the system SHALL launch the AI agent chat interface as a modal overlay

### Requirement 2

**User Story:** As a customer, I want to interact with the AI agent through multiple input methods, so that I can communicate in the most convenient way for my situation.

#### Acceptance Criteria

1. WHEN the chat interface loads THEN the system SHALL provide a text input field for natural language typing
2. WHEN the chat interface loads THEN the system SHALL include a microphone icon for voice input with visual listening indicators
3. WHEN the agent responds THEN the system SHALL offer suggested reply chips/buttons for common choices
4. WHEN a user types, speaks, or clicks suggested replies THEN the system SHALL process all input methods equivalently
5. WHEN voice input is activated THEN the system SHALL display visual feedback indicating the system is listening

### Requirement 3

**User Story:** As a customer, I want the AI agent to guide me through stopover category selection with rich, interactive content, so that I can make informed decisions about my travel options.

#### Acceptance Criteria

1. WHEN the conversation begins THEN the agent SHALL welcome the customer by name and reference their existing booking (PNR: X4HG8)
2. WHEN collecting stopover preferences THEN the agent SHALL first present stopover category options
3. WHEN displaying stopover category options THEN the system SHALL render four interactive cards (Standard: $80/night, Premium: $150/night, Premium Beach: $215/night, Luxury: $300/night)
4. WHEN showing category cards THEN each card SHALL include category image, name, star rating, price, and "Select" button in a horizontally scrollable carousel

### Requirement 4

**User Story:** As a customer, I want to select from specific hotels within my chosen stopover category, so that I can choose accommodation that meets my preferences and budget.

#### Acceptance Criteria

1. WHEN a stopover category is selected THEN the system SHALL display five hotel options from the premium category as sample hotels
2. WHEN displaying hotel options THEN the system SHALL render interactive cards for: Millennium Hotel Doha, Steigenberger Hotel, Souq Waqif Boutique Hotel, Crowne Plaza, Al Najada Doha
3. WHEN showing hotel cards THEN each card SHALL include hotel image, name, star rating, amenities, and "Select" button in a horizontally scrollable carousel
4. WHEN a hotel is selected THEN the system SHALL enable progression to timing and duration selection

### Requirement 5

**User Story:** As a customer, I want to specify my stopover timing and duration preferences through an intuitive interface, so that I can customize my travel experience.

#### Acceptance Criteria

1. WHEN a hotel is selected THEN the system SHALL present timing and duration selection options
2. WHEN selecting stopover timing THEN the system SHALL provide radio button options for "Outbound" (LHR to BKK) and "Return" (BKK to LHR)
3. WHEN selecting stopover duration THEN the system SHALL provide options for 1, 2, 3, or 4 nights with clear pricing implications

### Requirement 6

**User Story:** As Qatar Airways, I want to automatically recommend one suitable tour to the customer that aligns with the stopover date, so that I can provide personalized suggestions and increase tour bookings.

#### Acceptance Criteria

1. WHEN the customer reaches the extras selection step THEN the system SHALL automatically recommend the "Whalesharks of Qatar Tour" as a featured suggestion
2. WHEN the tour recommendation is displayed THEN the system SHALL highlight it as "Recommended for your dates" with special visual treatment
3. WHEN the recommended tour is shown THEN the system SHALL include tour details, pricing, and availability based on the selected stopover dates
4. WHEN the customer views the recommendation THEN the system SHALL provide easy one-click addition to their booking
5. WHEN the recommended tour is added THEN the system SHALL update the booking summary and total pricing accordingly

### Requirement 7

**User Story:** As a customer, I want to add optional extras like transfers and tours to my stopover package, so that I can enhance my Doha experience.

#### Acceptance Criteria

1. WHEN extras selection is presented THEN the system SHALL offer Airport Transfers ($60 return) as a toggle option
2. WHEN tours are offered THEN the system SHALL display a carousel of available tours including the featured tour (requirements 5) 
3. WHEN selecting tours THEN the system SHALL allow multiple tour selection with quantity controls for each tour
4. WHEN tours are selected THEN the system SHALL display a running total of selected tours and maintain a tour basket
5. WHEN extras are modified THEN the system SHALL update the total pricing in real-time

### Requirement 8

**User Story:** As a customer, I want to review a comprehensive summary of my stopover package before payment, so that I can verify all details and costs are correct.

#### Acceptance Criteria

1. WHEN the customer completes their selections THEN the system SHALL display a detailed summary including stopover timing, duration, hotel choice, and extras
2. WHEN the summary is shown THEN the system SHALL display updated flight routing (LHR → DOH (stay) → BKK → DOH → LHR)
3. WHEN calculating costs THEN the system SHALL include flight fare difference ($115), hotel costs, extras costs, and total amount
4. WHEN displaying pricing THEN the system SHALL offer both cash payment and Avios conversion options (125 Avios per $1)
5. WHEN the summary is complete THEN the system SHALL provide a "Proceed to Payment" button

### Requirement 9

**User Story:** As a customer, I want to complete payment securely within the chat interface, so that I can finalize my stopover booking without leaving the conversation flow.

#### Acceptance Criteria

1. WHEN payment is initiated THEN the system SHALL render a secure payment form within the chat interface
2. WHEN the payment form loads THEN the system SHALL include fields for credit card number, expiry date, CVV, and name on card
3. WHEN payment options are displayed THEN the system SHALL provide tabs for credit card and "Pay with Avios" options
4. WHEN Avios payment is selected THEN the system SHALL show mock Avios balance and confirmation button
5. WHEN payment is submitted THEN the system SHALL display confirmation with new PNR (X9FG1) and booking details

### Requirement 10

**User Story:** As a customer, I want to be able to login to Privilege Club and pay with Avios during payment, so that I can use my loyalty points for my stopover booking.

#### Acceptance Criteria

1. WHEN the payment form is displayed THEN the system SHALL provide a "Login to Privilege Club" option alongside credit card payment
2. WHEN "Login to Privilege Club" is selected THEN the system SHALL display a login form with username/email and password fields
3. WHEN login is successful THEN the system SHALL display the customer's mock Avios balance and available points for redemption
4. WHEN Avios payment is selected THEN the system SHALL calculate the required Avios (125 Avios per $1) and display the conversion
5. WHEN paying with Avios THEN the system SHALL show remaining balance after payment and provide confirmation of Avios redemption

### Requirement 11

**User Story:** As a customer using any device, I want the application to be fully responsive and accessible, so that I can complete my stopover booking regardless of my device or screen size.

#### Acceptance Criteria

1. WHEN the application loads on desktop THEN the system SHALL display the full chat interface with optimal spacing and layout
2. WHEN the application loads on mobile THEN the system SHALL adapt the interface for touch interaction and smaller screens
3. WHEN hotel cards are displayed THEN the system SHALL provide horizontal scrolling on mobile and appropriate grid layout on desktop
4. WHEN the chat modal opens from MMB page THEN the system SHALL slide up from bottom on mobile and center appropriately on desktop
5. WHEN any interactive element is displayed THEN the system SHALL ensure touch targets meet accessibility standards (minimum 44px)

### Requirement 12

**User Story:** As a customer, I want the application to strictly follow Qatar Airways' design system, so that the experience feels authentic and consistent with the brand.

#### Acceptance Criteria

1. WHEN any UI element is rendered THEN the system SHALL use colors, typography, and spacing defined in the Qatar Airways design system JSON
2. WHEN buttons are displayed THEN the system SHALL apply primary, secondary, and tertiary button styles as specified in the design system
3. WHEN the chat interface is shown THEN the system SHALL use the brand's color scheme with agent messages on left and user messages on right
4. WHEN cards and forms are rendered THEN the system SHALL apply consistent border radius, shadows, and spacing from the design system
5. WHEN the Qatar Airways logo is displayed THEN the system SHALL maintain proper sizing (max-width: 150px) and positioning



### Requirement 13

**User Story:** As a customer, I want the system to use realistic sample data consistently throughout the experience, so that the mockup feels authentic and demonstrates real-world usage.

#### Acceptance Criteria

1. WHEN customer data is referenced THEN the system SHALL consistently use Alex Johnson, Privilege Club QR12345678
2. WHEN booking details are shown THEN the system SHALL use PNR X4HG8, LHR-BKK-LHR routing for 2 adults
3. WHEN stopover category options are presented THEN the system SHALL use four specified categories with accurate pricing and descriptions
4. WHEN hotel options are presented THEN the system SHALL use the five specified hotels with accurate pricing and descriptions
5. WHEN add-ons are offered THEN the system SHALL use Airport Transfers ($60) and Whale Sharks of Qatar  ($195 per person)
6. WHEN final confirmation is shown THEN the system SHALL generate new PNR X9FG1 and maintain data consistency throughout the flow