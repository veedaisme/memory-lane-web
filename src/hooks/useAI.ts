import { useState } from 'react';
import { 
  aiService, 
  ChatMessage, 
  AIRequestOptions, 
  AIResponse,
  AI_DEFAULTS
} from '../integrations/ai';

interface UseAIOptions {
  initialMessages?: ChatMessage[];
  defaultOptions?: AIRequestOptions;
}

/**
 * React hook for interacting with the AI service
 */
export function useAI({ 
  initialMessages = [], 
  defaultOptions = {} 
}: UseAIOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Send a message to the AI and get a response
   */
  const sendMessage = async (
    content: string, 
    options?: AIRequestOptions
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add user message to the chat history
      const userMessage: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Merge default options with provided options
      const mergedOptions: AIRequestOptions = {
        maxTokens: AI_DEFAULTS.maxTokens,
        temperature: AI_DEFAULTS.temperature,
        ...defaultOptions,
        ...options
      };
      
      // Send to AI service
      const response = await aiService.chatCompletion(updatedMessages, mergedOptions);
      
      // Add AI response to chat history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.text
      };
      
      setMessages([...updatedMessages, assistantMessage]);
      return response;
    } catch (err: any) {
      const error = new Error(err.message || 'Failed to get AI response');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Clear the conversation history
   */
  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };
  
  /**
   * Add a system message to the conversation
   */
  const setSystemMessage = (content: string) => {
    // Check if there's already a system message
    const systemMessageIndex = messages.findIndex(msg => msg.role === 'system');
    
    if (systemMessageIndex >= 0) {
      // Replace existing system message
      const updatedMessages = [...messages];
      updatedMessages[systemMessageIndex] = { role: 'system', content };
      setMessages(updatedMessages);
    } else {
      // Add new system message at the beginning
      setMessages([{ role: 'system', content }, ...messages]);
    }
  };
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setSystemMessage,
    setMessages
  };
}
