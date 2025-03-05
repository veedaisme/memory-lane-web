import {
  AIProvider, 
  AIRequestOptions, 
  AIResponse, 
  ChatMessage 
} from './types';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';

/**
 * Available AI provider types
 */
export type AIProviderType = 'openai' | 'gemini';

/**
 * Factory class for managing AI providers using the Strategy pattern.
 * This class allows switching between different AI providers seamlessly.
 */
export class AIService {
  private static instance: AIService;
  private providers: Map<string, AIProvider> = new Map();
  private activeProvider: AIProvider | null = null;
  
  private constructor() {
    // Register all available providers
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new GeminiProvider());
  }
  
  /**
   * Get singleton instance of AIService
   */
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }
  
  /**
   * Register a new AI provider
   */
  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  /**
   * Set the active AI provider by type and initialize it with config
   */
  public useProvider(type: AIProviderType, config: Record<string, unknown>): void {
    const provider = this.providers.get(type);
    
    if (!provider) {
      throw new Error(`AI provider '${type}' not found. Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    
    provider.initialize(config);
    this.activeProvider = provider;
  }
  
  /**
   * Get the currently active provider
   */
  public getActiveProvider(): AIProvider | null {
    return this.activeProvider;
  }
  
  /**
   * Get a provider by type without making it active
   */
  public getProvider(type: AIProviderType): AIProvider | undefined {
    return this.providers.get(type);
  }
  
  /**
   * Send a chat completion request to the active provider
   */
  public async chatCompletion(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    if (!this.activeProvider) {
      throw new Error('No active AI provider set. Call useProvider() first.');
    }
    
    if (!this.activeProvider.isInitialized()) {
      throw new Error(`Provider ${this.activeProvider.name} is not initialized with API keys.`);
    }
    
    return this.activeProvider.chatCompletion(messages, options);
  }
}

// Export a singleton instance
export const aiService = AIService.getInstance();
