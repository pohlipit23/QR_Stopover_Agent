import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UserInput } from '../types';

interface MultiModalInputProps {
  onSubmit: (input: UserInput) => void;
  suggestedReplies?: string[];
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  error: string | null;
}

const MultiModalInput: React.FC<MultiModalInputProps> = ({
  onSubmit,
  suggestedReplies = [],
  disabled = false,
  placeholder = "Type your message...",
  isLoading = false,
  className = ""
}) => {
  // Text input state
  const [textInput, setTextInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  
  // Voice recording state
  const [voiceState, setVoiceState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
    error: null
  });

  // Refs
  const textInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Voice recording timer
  useEffect(() => {
    if (voiceState.isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setVoiceState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [voiceState.isRecording]);

  // Input validation
  const validateInput = useCallback((input: string): string | null => {
    if (!input.trim()) {
      return "Please enter a message";
    }
    if (input.length > 1000) {
      return "Message is too long (maximum 1000 characters)";
    }
    return null;
  }, []);

  // Handle text input submission
  const handleTextSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (disabled || isLoading) return;
    
    const trimmedInput = textInput.trim();
    const validationError = validateInput(trimmedInput);
    
    if (validationError) {
      setInputError(validationError);
      return;
    }

    const userInput: UserInput = {
      type: 'text',
      content: trimmedInput,
      metadata: {
        timestamp: new Date()
      }
    };

    onSubmit(userInput);
    setTextInput('');
    setInputError(null);
    
    // Focus back to input for continued typing
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  }, [textInput, disabled, isLoading, validateInput, onSubmit]);

  // Handle suggested reply click
  const handleSuggestedReply = useCallback((reply: string) => {
    if (disabled || isLoading) return;

    const userInput: UserInput = {
      type: 'button',
      content: reply,
      metadata: {
        buttonId: `suggested_${reply.toLowerCase().replace(/\s+/g, '_')}`,
        timestamp: new Date()
      }
    };

    onSubmit(userInput);
  }, [disabled, isLoading, onSubmit]);

  // Start voice recording
  const startVoiceRecording = useCallback(async () => {
    if (disabled || isLoading || voiceState.isRecording) return;

    try {
      // Check for microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Reset state
      audioChunksRef.current = [];
      setVoiceState({
        isRecording: true,
        isProcessing: false,
        duration: 0,
        error: null
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        processVoiceRecording();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

    } catch (error) {
      console.error('Voice recording error:', error);
      setVoiceState(prev => ({
        ...prev,
        error: 'Unable to access microphone. Please check permissions.'
      }));
    }
  }, [disabled, isLoading, voiceState.isRecording]);

  // Stop voice recording
  const stopVoiceRecording = useCallback(() => {
    if (!voiceState.isRecording || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setVoiceState(prev => ({
      ...prev,
      isRecording: false,
      isProcessing: true
    }));
  }, [voiceState.isRecording]);

  // Process voice recording (mock implementation)
  const processVoiceRecording = useCallback(async () => {
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Mock voice-to-text processing
      // In a real implementation, this would send the audio to a speech recognition service
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      
      // Mock transcription result
      const mockTranscriptions = [
        "I'd like to explore stopover options",
        "Show me hotels in Doha",
        "What tours are available?",
        "Let's get started",
        "I'm interested in premium options"
      ];
      
      const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      const userInput: UserInput = {
        type: 'voice',
        content: transcription,
        metadata: {
          voiceConfidence: 0.85 + Math.random() * 0.15, // Mock confidence score
          timestamp: new Date()
        }
      };

      onSubmit(userInput);
      
      setVoiceState({
        isRecording: false,
        isProcessing: false,
        duration: 0,
        error: null
      });

    } catch (error) {
      console.error('Voice processing error:', error);
      setVoiceState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'Failed to process voice input. Please try again.'
      }));
    }
  }, [onSubmit]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
    if (inputError) {
      setInputError(null);
    }
  }, [inputError]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  }, [handleTextSubmit]);

  // Format recording duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if voice recording is supported
  const isVoiceSupported = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined';

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Voice Recording Error */}
      {voiceState.error && (
        <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-lg p-3">
          <p className="text-accent-red text-sm">{voiceState.error}</p>
          <button
            onClick={() => setVoiceState(prev => ({ ...prev, error: null }))}
            className="text-accent-red text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Suggested Replies */}
      {suggestedReplies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedReply(reply)}
              disabled={disabled || isLoading}
              className="bg-white text-primary-burgundy border-2 border-neutral-light px-4 py-2 rounded-full text-sm font-medium hover:border-primary-burgundy hover:bg-neutral-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-primary-burgundy focus:ring-opacity-30"
              style={{
                minHeight: '44px' // Accessibility: minimum touch target
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Container */}
      <form onSubmit={handleTextSubmit} className="flex items-end space-x-3">
        {/* Text Input Field */}
        <div className="flex-1">
          <div className="relative">
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={voiceState.isRecording ? "Recording..." : placeholder}
              disabled={disabled || isLoading || voiceState.isRecording || voiceState.isProcessing}
              className={`
                w-full bg-white border-2 rounded-full px-4 py-3 pr-12
                font-jotia text-neutral-grey2 placeholder-neutral-grey1
                transition-all duration-200 outline-none
                ${inputError 
                  ? 'border-accent-red focus:ring-accent-red focus:ring-opacity-30' 
                  : 'border-neutral-light focus:border-primary-burgundy focus:ring-primary-burgundy focus:ring-opacity-30'
                }
                focus:ring-3
                disabled:bg-neutral-light disabled:border-neutral-grey1 disabled:cursor-not-allowed
              `}
              style={{
                minHeight: '44px' // Accessibility: minimum touch target
              }}
              aria-label="Type your message"
              aria-invalid={!!inputError}
              aria-describedby={inputError ? 'input-error' : undefined}
            />
            
            {/* Character Count */}
            {textInput.length > 800 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className={`text-xs ${textInput.length > 1000 ? 'text-accent-red' : 'text-neutral-grey1'}`}>
                  {textInput.length}/1000
                </span>
              </div>
            )}
          </div>
          
          {/* Input Error */}
          {inputError && (
            <p id="input-error" className="text-accent-red text-sm mt-1 ml-4">
              {inputError}
            </p>
          )}
        </div>

        {/* Voice Recording Button */}
        {isVoiceSupported && (
          <button
            type="button"
            onClick={voiceState.isRecording ? stopVoiceRecording : startVoiceRecording}
            disabled={disabled || isLoading || voiceState.isProcessing}
            className={`
              p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-primary-burgundy focus:ring-opacity-30
              ${voiceState.isRecording 
                ? 'bg-accent-red text-white animate-pulse' 
                : 'bg-neutral-light text-neutral-grey2 hover:bg-primary-burgundy hover:text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{
              minWidth: '44px',
              minHeight: '44px' // Accessibility: minimum touch target
            }}
            aria-label={voiceState.isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {voiceState.isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : voiceState.isRecording ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a2 2 0 114 0v4a2 2 0 11-4 0V7z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || isLoading || !textInput.trim() || voiceState.isRecording || voiceState.isProcessing}
          className="p-3 bg-primary-burgundy text-white rounded-full hover:bg-primary-burgundy-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-primary-burgundy focus:ring-opacity-30"
          style={{
            minWidth: '44px',
            minHeight: '44px' // Accessibility: minimum touch target
          }}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>

      {/* Voice Recording Indicator */}
      {voiceState.isRecording && (
        <div className="flex items-center justify-center space-x-2 bg-accent-red bg-opacity-10 rounded-lg p-3">
          <div className="w-3 h-3 bg-accent-red rounded-full animate-pulse"></div>
          <span className="text-accent-red font-medium text-sm">
            Recording: {formatDuration(voiceState.duration)}
          </span>
          <button
            onClick={stopVoiceRecording}
            className="text-accent-red text-sm underline ml-2"
          >
            Stop
          </button>
        </div>
      )}

      {/* Voice Processing Indicator */}
      {voiceState.isProcessing && (
        <div className="flex items-center justify-center space-x-2 bg-primary-burgundy bg-opacity-10 rounded-lg p-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-burgundy"></div>
          <span className="text-primary-burgundy font-medium text-sm">
            Processing voice input...
          </span>
        </div>
      )}
    </div>
  );
};

export default MultiModalInput;