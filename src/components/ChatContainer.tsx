import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import MultiModalInput from './MultiModalInput';
import type { 
  ConversationState, 
  Message, 
  CustomerData, 
  BookingData,
  ErrorState,
  LoadingState,
  UIState,
  UserInput
} from '../types';

interface ChatContainerProps {
  entryPoint: 'email' | 'mmb';
  isModal?: boolean;
  customer: CustomerData;
  booking: BookingData;
  onClose?: () => void;
  onConversationUpdate?: (state: ConversationState) => void;
}

interface ChatContainerState {
  conversation: ConversationState;
  error: ErrorState | null;
  loading: LoadingState;
  ui: UIState;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  entryPoint,
  isModal = false,
  customer,
  booking,
  onClose,
  onConversationUpdate
}) => {
  // State management
  const [state, setState] = useState<ChatContainerState>({
    conversation: {
      messages: [],
      currentStep: 'welcome',
      awaitingInput: false,
      suggestedReplies: []
    },
    error: null,
    loading: {
      isLoading: false,
      operation: '',
      progress: 0
    },
    ui: {
      isModalOpen: isModal,
      currentView: 'chat',
      isMobile: false,
      isVoiceRecording: false
    }
  });

  // Refs for DOM manipulation and persistence
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string>(`conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setState(prev => ({
        ...prev,
        ui: { ...prev.ui, isMobile }
      }));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.conversation.messages, scrollToBottom]);

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation();
  }, [customer, booking, entryPoint]);

  // Conversation persistence
  useEffect(() => {
    if (onConversationUpdate) {
      onConversationUpdate(state.conversation);
    }
    
    // Persist conversation state to localStorage
    try {
      localStorage.setItem(
        `qatar_stopover_conversation_${conversationIdRef.current}`,
        JSON.stringify({
          ...state.conversation,
          timestamp: Date.now(),
          customer,
          booking
        })
      );
    } catch (error) {
      console.warn('Failed to persist conversation state:', error);
    }
  }, [state.conversation, customer, booking, onConversationUpdate]);

  // Initialize conversation with welcome message
  const initializeConversation = useCallback(() => {
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}_welcome`,
      sender: 'agent',
      content: {
        type: 'text',
        text: `Hello ${customer.name}! I'm here to help you add a stopover in Doha to your ${booking.route.origin} to ${booking.route.destination} journey (${booking.pnr}). Let's explore some amazing options for your layover!`
      },
      timestamp: new Date(),
      metadata: {
        conversationId: conversationIdRef.current,
        stepId: 'welcome',
        requiresResponse: true
      }
    };

    setState(prev => ({
      ...prev,
      conversation: {
        messages: [welcomeMessage],
        currentStep: 'welcome',
        awaitingInput: true,
        suggestedReplies: [
          "Let's get started!",
          "Show me stopover options",
          "What's included?"
        ]
      }
    }));
  }, [customer, booking]);

  // Error boundary and recovery
  const handleError = useCallback((error: ErrorState) => {
    setState(prev => ({
      ...prev,
      error,
      loading: { isLoading: false, operation: '', progress: 0 }
    }));

    // Add error message to conversation
    const errorMessage: Message = {
      id: `msg_${Date.now()}_error`,
      sender: 'agent',
      content: {
        type: 'text',
        text: `I apologize, but I encountered an issue: ${error.message}. ${error.recoveryAction || 'Please try again.'}`
      },
      timestamp: new Date(),
      metadata: {
        conversationId: conversationIdRef.current,
        stepId: 'error'
      }
    };

    setState(prev => ({
      ...prev,
      conversation: {
        ...prev.conversation,
        messages: [...prev.conversation.messages, errorMessage],
        suggestedReplies: error.retryable ? ['Try again', 'Start over'] : ['Start over']
      }
    }));
  }, []);

  // Loading state management
  const setLoading = useCallback((loading: Partial<LoadingState>) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, ...loading }
    }));
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Handle rich content actions from MessageBubble
  const handleRichContentAction = useCallback((action: string, data: any) => {
    console.log('Rich content action:', action, data);
    
    // Add user message for the action taken
    const userMessage: Message = {
      id: `msg_${Date.now()}_user_action`,
      sender: 'user',
      content: {
        type: 'text',
        text: `Selected: ${data.title || data.name || action}`
      },
      timestamp: new Date(),
      metadata: {
        conversationId: conversationIdRef.current,
        stepId: state.conversation.currentStep
      }
    };

    setState(prev => ({
      ...prev,
      conversation: {
        ...prev.conversation,
        messages: [...prev.conversation.messages, userMessage]
      }
    }));

    // Handle different action types
    switch (action) {
      case 'select':
        // Handle selection actions (hotels, categories, etc.)
        break;
      case 'next':
        // Handle progression to next step
        break;
      default:
        console.log('Unhandled action:', action);
    }
  }, [state.conversation.currentStep]);

  // Handle form submissions from MessageBubble
  const handleFormSubmit = useCallback((formData: any) => {
    console.log('Form submitted:', formData);
    
    // Add user message for the form submission
    const userMessage: Message = {
      id: `msg_${Date.now()}_user_form`,
      sender: 'user',
      content: {
        type: 'text',
        text: 'Form submitted successfully'
      },
      timestamp: new Date(),
      metadata: {
        conversationId: conversationIdRef.current,
        stepId: state.conversation.currentStep
      }
    };

    setState(prev => ({
      ...prev,
      conversation: {
        ...prev.conversation,
        messages: [...prev.conversation.messages, userMessage]
      }
    }));
  }, [state.conversation.currentStep]);

  // Handle user input from MultiModalInput
  const handleUserInput = useCallback((input: UserInput) => {
    console.log('User input received:', input);
    
    // Update voice recording state in UI
    if (input.type === 'voice') {
      setState(prev => ({
        ...prev,
        ui: { ...prev.ui, isVoiceRecording: false }
      }));
    }
    
    // Add user message to conversation
    const userMessage: Message = {
      id: `msg_${Date.now()}_user_${input.type}`,
      sender: 'user',
      content: {
        type: 'text',
        text: input.content
      },
      timestamp: new Date(),
      metadata: {
        conversationId: conversationIdRef.current,
        stepId: state.conversation.currentStep,
        ...input.metadata
      }
    };

    // Simulate agent response based on input
    const generateAgentResponse = (userInput: string): Message => {
      let responseText = '';
      let newSuggestedReplies: string[] = [];
      
      const lowerInput = userInput.toLowerCase();
      
      if (lowerInput.includes('start') || lowerInput.includes('begin') || lowerInput.includes('get started')) {
        responseText = "Perfect! Let's start by selecting your stopover category. I have four amazing options for you to choose from, each offering different levels of luxury and amenities.";
        newSuggestedReplies = ['Show me the categories', 'What are my options?', 'Tell me about premium options'];
      } else if (lowerInput.includes('option') || lowerInput.includes('show me')) {
        responseText = "I'd be happy to show you the available stopover options! We have categories ranging from Standard to Luxury, each with carefully selected hotels and experiences.";
        newSuggestedReplies = ['Show categories', 'What\'s included?', 'Tell me about hotels'];
      } else if (lowerInput.includes('include') || lowerInput.includes('what')) {
        responseText = "Great question! Each stopover package includes accommodation, and you can add extras like airport transfers and exciting tours. The packages vary by category - from comfortable Standard options to luxurious Premium Beach experiences.";
        newSuggestedReplies = ['Show me categories', 'Tell me about tours', 'What are the prices?'];
      } else {
        responseText = "I understand! Let me help you find the perfect stopover experience. Would you like to see the available categories, or do you have specific questions about what's included?";
        newSuggestedReplies = ['Show categories', 'What\'s included?', 'Tell me about pricing'];
      }
      
      return {
        id: `msg_${Date.now()}_agent_response`,
        sender: 'agent',
        content: {
          type: 'text',
          text: responseText
        },
        timestamp: new Date(),
        metadata: {
          conversationId: conversationIdRef.current,
          stepId: state.conversation.currentStep,
          requiresResponse: true
        }
      };
    };

    // Set loading state
    setLoading({ isLoading: true, operation: 'Processing your message...' });
    
    // Simulate processing delay
    setTimeout(() => {
      const agentResponse = generateAgentResponse(input.content);
      
      setState(prev => ({
        ...prev,
        conversation: {
          ...prev.conversation,
          messages: [...prev.conversation.messages, userMessage, agentResponse],
          suggestedReplies: agentResponse.metadata?.requiresResponse ? 
            (agentResponse.content.text?.includes('categories') ? 
              ['Show categories', 'What\'s included?', 'Tell me about pricing'] : 
              ['Continue', 'Tell me more', 'What\'s next?']) : []
        },
        loading: { isLoading: false, operation: '', progress: 0 }
      }));
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    
  }, [state.conversation.currentStep, setLoading]);

  // Handle modal close with confirmation if conversation is active
  const handleClose = useCallback(() => {
    if (state.conversation.messages.length > 1) {
      const confirmClose = window.confirm(
        'Are you sure you want to close? Your conversation progress will be saved.'
      );
      if (!confirmClose) return;
    }
    
    onClose?.();
  }, [state.conversation.messages.length, onClose]);

  // Keyboard event handling for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModal) {
        handleClose();
      }
    };

    if (isModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModal, handleClose]);

  // Modal backdrop click handling
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && isModal) {
      handleClose();
    }
  }, [isModal, handleClose]);

  // Render loading overlay
  const renderLoadingOverlay = () => {
    if (!state.loading.isLoading) return null;

    return (
      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-burgundy mx-auto mb-4"></div>
          <p className="text-neutral-grey2 font-medium">{state.loading.operation}</p>
          {state.loading.progress && state.loading.progress > 0 && (
            <div className="w-32 bg-neutral-light rounded-full h-2 mt-2">
              <div 
                className="bg-primary-burgundy h-2 rounded-full transition-all duration-300"
                style={{ width: `${state.loading.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    if (!state.error) return null;

    return (
      <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-accent-red mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="text-accent-red font-medium mb-1">
              {state.error.type === 'validation' ? 'Validation Error' : 
               state.error.type === 'network' ? 'Connection Error' : 'System Error'}
            </h4>
            <p className="text-neutral-grey2 text-sm">{state.error.message}</p>
            {state.error.retryable && (
              <button
                onClick={clearError}
                className="mt-2 text-sm text-primary-burgundy hover:underline font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main chat container classes
  const containerClasses = `
    ${isModal 
      ? `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 ${
          state.ui.isMobile ? 'items-end p-0' : ''
        }`
      : 'w-full h-full'
    }
  `;

  const chatClasses = `
    bg-white rounded-2xl shadow-lg flex flex-col relative overflow-hidden
    ${isModal 
      ? state.ui.isMobile 
        ? 'w-full h-[90vh] rounded-t-2xl rounded-b-none animate-slide-up' 
        : 'w-full max-w-4xl h-[80vh] animate-fade-in'
      : 'w-full h-full'
    }
  `;

  return (
    <div className={containerClasses} onClick={handleBackdropClick}>
      <div 
        ref={chatContainerRef}
        className={chatClasses}
        role="dialog"
        aria-labelledby="chat-title"
        aria-describedby="chat-description"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-light bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-burgundy rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 id="chat-title" className="font-semibold text-neutral-grey2">
                Qatar Airways Stopover Assistant
              </h2>
              <p id="chat-description" className="text-sm text-neutral-grey1">
                {state.loading.isLoading ? 'Processing...' : 'Online and ready to help'}
              </p>
            </div>
          </div>
          
          {isModal && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-light rounded-full transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5 text-neutral-grey2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="p-4 border-b border-neutral-light">
            {renderError()}
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-light bg-opacity-30">
          <div className="flex flex-col space-y-2">
            {state.conversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                sender={message.sender}
                timestamp={message.timestamp}
                onFormSubmit={handleFormSubmit}
                onRichContentAction={handleRichContentAction}
              />
            ))}
          </div>
          

          
          <div ref={messagesEndRef} />
        </div>

        {/* Multi-Modal Input Area */}
        <div className="p-4 border-t border-neutral-light bg-white rounded-b-2xl">
          <MultiModalInput
            onSubmit={handleUserInput}
            suggestedReplies={state.conversation.suggestedReplies}
            disabled={state.loading.isLoading || !!state.error}
            isLoading={state.loading.isLoading}
            placeholder="Type your message or use voice input..."
          />
        </div>

        {/* Loading Overlay */}
        {renderLoadingOverlay()}
      </div>
    </div>
  );
};

export default ChatContainer;