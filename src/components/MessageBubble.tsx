import React from 'react';
import type { Message, RichContent, FormContent } from '../types';

interface MessageBubbleProps {
  message: Message;
  sender: 'agent' | 'user';
  timestamp: Date;
  onFormSubmit?: (formData: any) => void;
  onRichContentAction?: (action: string, data: any) => void;
}

interface DeliveryStatusProps {
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
}

const DeliveryStatus: React.FC<DeliveryStatusProps> = ({ status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex text-blue-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs opacity-70">
      {getStatusIcon()}
      <span>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

const RichContentRenderer: React.FC<{
  content: RichContent;
  onAction?: (action: string, data: any) => void;
}> = ({ content, onAction }) => {
  switch (content.type) {
    case 'carousel':
      return (
        <div className="space-y-3">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {content.data.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                {item.price && (
                  <p className="text-lg font-semibold text-primary-burgundy mb-3">
                    ${item.price}
                  </p>
                )}
                <button
                  onClick={() => onAction?.('select', item)}
                  className="w-full bg-primary-burgundy text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'card':
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {content.data.image && (
            <img
              src={content.data.image}
              alt={content.data.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {content.data.title}
          </h3>
          <p className="text-gray-600 mb-4">{content.data.description}</p>
          {content.data.actions && (
            <div className="flex space-x-2">
              {content.data.actions.map((action: any, index: number) => (
                <button
                  key={index}
                  onClick={() => onAction?.(action.type, action.data)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    action.primary
                      ? 'bg-primary-burgundy text-white hover:bg-opacity-90'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );

    case 'summary':
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {content.data.title || 'Booking Summary'}
          </h3>
          <div className="space-y-3">
            {content.data.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
            {content.data.total && (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary-burgundy">{content.data.total}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            Rich content type "{content.type}" not yet implemented
          </p>
        </div>
      );
  }
};

const FormRenderer: React.FC<{
  content: FormContent;
  onSubmit?: (formData: any) => void;
}> = ({ content, onSubmit }) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
      {content.fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.type === 'select' ? (
            <select
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent"
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'radio' ? (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={formData[field.id] === option}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    required={field.required}
                    className="mr-2 text-primary-burgundy focus:ring-primary-burgundy"
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : field.type === 'checkbox' ? (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData[field.id] || false}
                onChange={(e) => handleInputChange(field.id, e.target.checked)}
                className="mr-2 text-primary-burgundy focus:ring-primary-burgundy"
              />
              {field.label}
            </label>
          ) : (
            <input
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-burgundy focus:border-transparent"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      ))}
      
      <button
        type="submit"
        className="w-full bg-primary-burgundy text-white py-3 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors"
      >
        {content.submitLabel}
      </button>
    </form>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  timestamp,
  onFormSubmit,
  onRichContentAction
}) => {
  const isAgent = sender === 'agent';
  const isUser = sender === 'user';

  // Message bubble styling based on Qatar Airways design system
  const bubbleClasses = `
    max-w-[80%] p-4 rounded-2xl relative
    ${isAgent 
      ? 'bg-neutral-lightGrey text-neutral-grey2 rounded-bl-sm self-start' 
      : 'bg-primary-burgundy text-white rounded-br-sm self-end'
    }
    shadow-sm transition-all duration-200 hover:shadow-md
  `;

  const containerClasses = `
    flex mb-4
    ${isUser ? 'justify-end' : 'justify-start'}
  `;

  const renderMessageContent = () => {
    switch (message.content.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content.text}
            </p>
          </div>
        );

      case 'rich':
        return (
          <div className="space-y-3">
            {message.content.text && (
              <p className="text-sm leading-relaxed mb-3">
                {message.content.text}
              </p>
            )}
            <RichContentRenderer
              content={message.content.richContent!}
              onAction={onRichContentAction}
            />
          </div>
        );

      case 'form':
        return (
          <div className="space-y-3">
            {message.content.text && (
              <p className="text-sm leading-relaxed mb-3">
                {message.content.text}
              </p>
            )}
            <FormRenderer
              content={message.content.formData!}
              onSubmit={onFormSubmit}
            />
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-3">
            {message.content.text && (
              <p className="text-sm leading-relaxed mb-3">
                {message.content.text}
              </p>
            )}
            <RichContentRenderer
              content={{
                type: 'summary',
                data: message.content.richContent?.data || {}
              }}
              onAction={onRichContentAction}
            />
          </div>
        );

      default:
        return (
          <p className="text-sm leading-relaxed">
            {message.content.text || 'Unsupported message type'}
          </p>
        );
    }
  };

  const renderMetadata = () => {
    if (!message.metadata) return null;

    return (
      <div className="mt-2 text-xs opacity-70">
        {message.metadata.stepId && (
          <span className="inline-block bg-black bg-opacity-10 px-2 py-1 rounded-full mr-2">
            Step: {message.metadata.stepId}
          </span>
        )}
        {message.metadata.requiresResponse && (
          <span className="inline-block bg-yellow-500 bg-opacity-20 px-2 py-1 rounded-full">
            Response required
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        {/* Message Content */}
        {renderMessageContent()}
        
        {/* Message Metadata */}
        {renderMetadata()}
        
        {/* Timestamp and Delivery Status */}
        <div className={`flex items-center justify-between mt-3 pt-2 border-t border-opacity-20 ${
          isAgent ? 'border-gray-300' : 'border-white'
        }`}>
          <span className={`text-xs ${
            isAgent ? 'text-neutral-grey1' : 'text-white text-opacity-70'
          }`}>
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
          
          {/* Delivery Status for User Messages */}
          {isUser && (
            <DeliveryStatus 
              status="delivered" 
              timestamp={timestamp}
            />
          )}
        </div>
        
        {/* Agent Avatar for Agent Messages */}
        {isAgent && (
          <div className="absolute -left-2 -bottom-1 w-6 h-6 bg-primary-burgundy rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;