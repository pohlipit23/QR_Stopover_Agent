import React, { useState, useEffect } from 'react';
import { useChat } from 'ai/react';

interface SimpleChatContainerProps {
  customer: any;
  booking: any;
}

const SimpleChatContainer: React.FC<SimpleChatContainerProps> = ({ customer, booking }) => {
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat-simple',
    initialMessages: isClient ? [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${customer?.name || 'there'}! I'm here to help you add a stopover in Doha to your booking ${booking?.pnr || ''}. What would you like to know about our stopover packages?`
      }
    ] : []
  });

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="bg-purple-900 text-white p-4">
          <h2 className="text-xl font-semibold">Qatar Airways Stopover Assistant</h2>
          <p className="text-sm opacity-90">Loading...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-purple-900 text-white p-4">
        <h2 className="text-xl font-semibold">Qatar Airways Stopover Assistant</h2>
        <p className="text-sm opacity-90">
          {isLoading ? 'AI is thinking...' : 'Online and ready to help'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-900 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 rounded">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-900 text-white px-6 py-2 rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default SimpleChatContainer;