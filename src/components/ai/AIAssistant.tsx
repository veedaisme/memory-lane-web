import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { AI_DEFAULTS } from '../../integrations/ai';

interface AIAssistantProps {
  onSuggestion?: (suggestion: string) => void;
  placeholder?: string;
  systemPrompt?: string;
}

/**
 * A simple AI assistant component that allows users to ask questions
 * and get AI-powered responses.
 */
const AIAssistant: React.FC<AIAssistantProps> = ({
  onSuggestion,
  placeholder = 'Ask the AI assistant...',
  systemPrompt = AI_DEFAULTS.systemMessage,
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useAI({
    initialMessages: [
      { role: 'system', content: systemPrompt }
    ]
  });
  
  // Filter out system messages for display
  const displayMessages = messages.filter(msg => msg.role !== 'system');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  const handleUseResponse = (content: string) => {
    if (onSuggestion) {
      onSuggestion(content);
    }
  };
  
  return (
    <div className="bg-card border rounded-lg shadow-sm p-4 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">AI Assistant</h3>
        <button
          onClick={clearMessages}
          className="text-sm text-muted-foreground hover:text-primary"
          aria-label="Clear conversation"
        >
          Clear
        </button>
      </div>
      
      <div className="h-64 overflow-y-auto mb-4 space-y-3 bg-background p-3 rounded-md">
        {displayMessages.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Ask me anything about your journal or for help organizing your thoughts!
          </p>
        ) : (
          displayMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                
                {msg.role === 'assistant' && onSuggestion && (
                  <button
                    onClick={() => handleUseResponse(msg.content)}
                    className="text-xs mt-1 text-blue-500 hover:text-blue-700"
                    aria-label="Use this suggestion"
                  >
                    Use suggestion
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-destructive/10 text-destructive rounded-md text-sm">
          {error.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-background border rounded-md text-sm"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
