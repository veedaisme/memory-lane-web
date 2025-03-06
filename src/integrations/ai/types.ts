// AI service types

/**
 * Generic request type for all AI models
 */
export interface AIRequestOptions {
  // Maximum number of tokens to generate in the response
  maxTokens?: number;
  // Value between 0 and 2 controlling randomness (higher = more random)
  temperature?: number;
  // Stop sequence to end generation
  stopSequences?: string[];
  // System message/instructions to set context for the AI
  systemMessage?: string;
}

/**
 * Generic chat message structure for all AI providers
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Response format from AI services
 */
export interface AIResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Error returned from AI services
 */
export interface AIError {
  message: string;
  code?: string;
  type?: string;
  param?: string;
}

/**
 * Abstract interface that all AI provider strategies must implement
 */
export interface AIProvider {
  // Unique identifier for the provider
  readonly id: string;
  
  // Human-readable name of the provider
  readonly name: string;
  
  /**
   * Send a chat completion request to the AI provider
   * @param messages The conversation history
   * @param options Request options specific to this provider
   * @returns Promise resolving to the AI response
   */
  chatCompletion(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse>;
  
  /**
   * Initialize the provider with API keys and configuration
   * @param config Configuration object containing API keys and other settings
   */
  initialize(config: Record<string, unknown>): void;
  
  /**
   * Check if the provider is properly initialized
   */
  isInitialized(): boolean;
}
