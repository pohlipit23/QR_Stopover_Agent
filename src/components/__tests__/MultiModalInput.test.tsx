import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiModalInput from '../MultiModalInput';
import type { UserInput } from '../../types';

// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  onstop: jest.fn(),
}));

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
});

describe('MultiModalInput', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    suggestedReplies: ['Yes', 'No', 'Tell me more'],
    disabled: false,
    placeholder: 'Type your message...',
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders text input field', () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const textInput = screen.getByLabelText('Type your message');
    expect(textInput).toBeInTheDocument();
    expect(textInput).toHaveAttribute('placeholder', 'Type your message...');
  });

  test('renders suggested reply chips', () => {
    render(<MultiModalInput {...defaultProps} />);
    
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Tell me more')).toBeInTheDocument();
  });

  test('renders voice recording button', () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const voiceButton = screen.getByLabelText('Start voice recording');
    expect(voiceButton).toBeInTheDocument();
  });

  test('renders send button', () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeInTheDocument();
  });

  test('handles text input submission', async () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const textInput = screen.getByLabelText('Type your message');
    const sendButton = screen.getByLabelText('Send message');
    
    fireEvent.change(textInput, { target: { value: 'Hello world' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'text',
        content: 'Hello world',
        metadata: {
          timestamp: expect.any(Date),
        },
      });
    });
  });

  test('handles suggested reply click', async () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'button',
        content: 'Yes',
        metadata: {
          buttonId: 'suggested_yes',
          timestamp: expect.any(Date),
        },
      });
    });
  });

  test('validates empty input', async () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a message')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('validates input length', async () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const textInput = screen.getByLabelText('Type your message');
    const longMessage = 'a'.repeat(1001);
    
    fireEvent.change(textInput, { target: { value: longMessage } });
    
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message is too long (maximum 1000 characters)')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('handles Enter key submission', async () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const textInput = screen.getByLabelText('Type your message');
    
    fireEvent.change(textInput, { target: { value: 'Hello world' } });
    fireEvent.keyDown(textInput, { key: 'Enter', shiftKey: false });
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'text',
        content: 'Hello world',
        metadata: {
          timestamp: expect.any(Date),
        },
      });
    });
  });

  test('disables input when loading', () => {
    render(<MultiModalInput {...defaultProps} isLoading={true} />);
    
    const textInput = screen.getByLabelText('Type your message');
    const sendButton = screen.getByLabelText('Send message');
    const voiceButton = screen.getByLabelText('Start voice recording');
    
    expect(textInput).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(voiceButton).toBeDisabled();
  });

  test('disables input when disabled prop is true', () => {
    render(<MultiModalInput {...defaultProps} disabled={true} />);
    
    const textInput = screen.getByLabelText('Type your message');
    const sendButton = screen.getByLabelText('Send message');
    const voiceButton = screen.getByLabelText('Start voice recording');
    
    expect(textInput).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(voiceButton).toBeDisabled();
  });

  test('meets accessibility requirements', () => {
    render(<MultiModalInput {...defaultProps} />);
    
    // Check minimum touch targets (44px)
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button);
      expect(parseInt(styles.minHeight) >= 44 || parseInt(styles.height) >= 44).toBeTruthy();
    });
    
    // Check ARIA labels
    expect(screen.getByLabelText('Type your message')).toBeInTheDocument();
    expect(screen.getByLabelText('Start voice recording')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  test('shows character count when approaching limit', () => {
    render(<MultiModalInput {...defaultProps} />);
    
    const textInput = screen.getByLabelText('Type your message');
    const longMessage = 'a'.repeat(850);
    
    fireEvent.change(textInput, { target: { value: longMessage } });
    
    expect(screen.getByText('850/1000')).toBeInTheDocument();
  });

  test('applies Qatar Airways design system classes', () => {
    render(<MultiModalInput {...defaultProps} />);
    
    // Check for primary burgundy color usage
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toHaveClass('bg-primary-burgundy');
    
    // Check for suggested reply styling
    const yesButton = screen.getByText('Yes');
    expect(yesButton).toHaveClass('text-primary-burgundy');
  });
});