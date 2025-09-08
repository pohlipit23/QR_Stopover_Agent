// Core Data Interfaces
export interface CustomerData {
  name: string;
  privilegeClubNumber: string;
  email?: string;
}

export interface BookingData {
  pnr: string;
  route: FlightRoute;
  passengers: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface FlightRoute {
  origin: string;
  destination: string;
  stops: string[];
  routing: string;
}

// Stopover-Specific Models
export interface StopoverCategory {
  id: string;
  name: string;
  category: 'standard' | 'premium' | 'premium beach' | 'luxury';
  starRating: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}

export interface HotelOption {
  id: string;
  name: string;
  category: '4-star' | '5-star' | '5-star deluxe';
  starRating: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}

export interface TourOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  highlights: string[];
  maxParticipants: number;
}

export interface SelectedTour {
  tour: TourOption;
  quantity: number;
  totalPrice: number;
}

export interface TransferOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'airport-transfer';
}

export interface SelectedExtras {
  transfers?: TransferOption;
  tours: SelectedTour[];
  totalExtrasPrice: number;
}

export interface StopoverSelection {
  timing: 'outbound' | 'return';
  duration: number;
  stopovertype: StopoverCategory;
  hotel: HotelOption;
  extras: SelectedExtras;
}

// Authentication Models
export interface LoginData {
  email: string;
  password: string;
}

export interface PrivilegeClubAccount {
  memberId: string;
  memberName: string;
  tierStatus: 'Silver' | 'Gold' | 'Platinum';
  aviosBalance: number;
  isLoggedIn: boolean;
}

export interface PaymentData {
  method: 'credit-card' | 'avios';
  creditCard?: CreditCardData;
  aviosRedemption?: AviosPaymentData;
}

export interface CreditCardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

export interface AviosPaymentData {
  aviosUsed: number;
  remainingBalance: number;
  conversionRate: number; // 125 Avios per $1
}

// Message and Interaction Models
export interface Message {
  id: string;
  sender: 'agent' | 'user';
  content: MessageContent;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageContent {
  type: 'text' | 'rich' | 'form' | 'summary';
  text?: string;
  richContent?: RichContent;
  formData?: FormContent;
}

export interface MessageMetadata {
  conversationId?: string;
  stepId?: string;
  requiresResponse?: boolean;
}

export interface RichContent {
  type: 'carousel' | 'card' | 'form' | 'summary' | 'stopover-categories' | 'hotels' | 'stopover-options' | 'stopover-extras' | 'tours';
  data: any;
}

export interface SummaryData {
  title?: string;
  type?: 'confirmation' | 'booking' | 'payment';
  newPNR?: string;
  flightRoute?: {
    origin: string;
    destination: string;
    stopover?: string;
    timing?: string;
    duration?: string;
  };
  sections?: SummarySection[];
  items?: SummaryItem[];
  pricing?: {
    breakdown?: SummaryItem[];
    total?: string;
    aviosEquivalent?: string;
  };
  actions?: SummaryAction[];
}

export interface SummarySection {
  title: string;
  items: SummaryItem[];
}

export interface SummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface SummaryAction {
  type: string;
  label: string;
  primary?: boolean;
  data?: any;
}

export interface FormContent {
  type: 'payment' | 'selection' | 'login';
  fields: FormField[];
  submitLabel: string;
  data?: {
    totalAmount?: number;
    totalAviosPrice?: number;
    aviosBalance?: number;
  };
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'select' | 'radio' | 'checkbox';
  label: string;
  required: boolean;
  options?: string[];
  value?: any;
}

export interface UserInput {
  type: 'text' | 'voice' | 'button';
  content: string;
  metadata?: InputMetadata;
}

export interface InputMetadata {
  buttonId?: string;
  voiceConfidence?: number;
  timestamp: Date;
}

// Conversation State Models
export interface ConversationState {
  messages: Message[];
  currentStep: ConversationStep;
  awaitingInput: boolean;
  suggestedReplies: string[];
}

export type ConversationStep = 
  | 'welcome'
  | 'category-selection'
  | 'hotel-selection'
  | 'timing-duration'
  | 'extras-selection'
  | 'booking-summary'
  | 'payment'
  | 'confirmation';

// Pricing and Booking State Models
export interface PricingBreakdown {
  hotelCost: number;
  flightFareDifference: number;
  transfersCost: number;
  toursCost: number;
  totalCashPrice: number;
  totalAviosPrice: number;
}

export interface BookingState {
  customer: CustomerData;
  originalBooking: BookingData;
  stopoverSelection?: StopoverSelection;
  pricing?: PricingBreakdown;
  paymentStatus: 'pending' | 'processing' | 'completed';
}

// Tour Recommendation Models
export interface RecommendedTour extends TourOption {
  isRecommended: boolean;
  recommendationReason: string;
  availabilityStatus: 'available' | 'limited' | 'unavailable';
  matchScore: number; // 0-100 based on stopover dates and preferences
}

// Additional Supporting Models
export interface AddOnOption {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'transfer' | 'tour' | 'experience';
}

// Error and Loading State Models
export interface ErrorState {
  type: 'validation' | 'system' | 'network' | 'llm' | 'function-call';
  message: string;
  recoveryAction?: string;
  retryable: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  operation: string;
  progress?: number;
}

// UI State Models
export interface UIState {
  isModalOpen: boolean;
  currentView: 'chat' | 'summary' | 'payment';
  isMobile: boolean;
  isVoiceRecording: boolean;
}

// Test Data Models
export interface TestScenarios {
  happyPath: UserFlowTest;
  errorHandling: ErrorScenarioTest[];
  edgeCases: EdgeCaseTest[];
  accessibility: AccessibilityTest[];
  performance: PerformanceTest[];
}

export interface UserFlowTest {
  name: string;
  steps: TestStep[];
  expectedOutcome: string;
}

export interface ErrorScenarioTest {
  name: string;
  errorType: string;
  triggerCondition: string;
  expectedRecovery: string;
}

export interface EdgeCaseTest {
  name: string;
  scenario: string;
  expectedBehavior: string;
}

export interface AccessibilityTest {
  name: string;
  requirement: string;
  testMethod: string;
}

export interface PerformanceTest {
  name: string;
  metric: string;
  threshold: number;
}

export interface TestStep {
  action: string;
  input?: any;
  expectedResult: string;
}