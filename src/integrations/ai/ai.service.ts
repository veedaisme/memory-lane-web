
import {
  AIProvider, 
  AIRequestOptions, 
  AIResponse, 
  ChatMessage,
  EmbeddingRequestOptions,
  EmbeddingResponse
} from './types';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AI_CONFIG } from '@/config';

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
  private activeProvider: string = AI_CONFIG.defaultProvider;
  private initialized: boolean = false;
  
  private constructor() {
    // Register all available providers
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('gemini', new GeminiProvider());
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
  public registerProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider);
    console.log(`AI Provider registered: ${name}`);
  }
  
  /**
   * Set the active AI provider by type and initialize it with config
   */
  public setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`AI provider '${name}' not found. Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    this.activeProvider = name;
    console.log(`Active AI Provider set to: ${name}`);
  }
  
  /**
   * Get the active AI provider
   */
  public getActiveProvider(): AIProvider | undefined {
    return this.providers.get(this.activeProvider);
  }
  
  /**
   * Get a provider by type without making it active
   */
  public getProvider(type: AIProviderType): AIProvider | undefined {
    return this.providers.get(type);
  }
  
  /**
   * Get all registered AI providers
   * @returns Map of all registered providers
   */
  public getProviders(): Map<string, AIProvider> {
    return this.providers;
  }
  
  /**
   * Get the name of the active provider
   * @returns The name of the active provider
   */
  public getActiveProviderName(): string {
    return this.activeProvider;
  }
  
  /**
   * Check if the service has been initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Initialize all registered AI providers with centralized config
   */
  public async initializeProviders(): Promise<boolean> {
    let hasInitializedAny = false;
    
    // Initialize OpenAI if registered
    const openaiProvider = this.providers.get('openai');
    if (openaiProvider) {
      try {
        // Check if API key is available
        if (!AI_CONFIG.openai.apiKey) {
          console.warn('OpenAI provider initialization skipped: No API key provided');
        } else {
          // Debug log the configuration
          console.log('Attempting to initialize OpenAI provider with config:', {
            apiKey: AI_CONFIG.openai.apiKey ? '(set)' : '(not set)',
            model: AI_CONFIG.openai.model,
            organization: AI_CONFIG.openai.organization,
            baseUrl: AI_CONFIG.openai.baseUrl
          });
          
          await openaiProvider.initialize(AI_CONFIG.openai);
          console.log('AI Provider initialized: openai');
          hasInitializedAny = true;
        }
      } catch (error) {
        console.error('Failed to initialize AI Provider "openai":', error);
      }
    }
    
    // Initialize Gemini if registered
    const geminiProvider = this.providers.get('gemini');
    if (geminiProvider) {
      try {
        // Check if API key is available
        if (!AI_CONFIG.gemini.apiKey) {
          console.warn('Gemini provider initialization skipped: No API key provided');
        } else {
          await geminiProvider.initialize(AI_CONFIG.gemini);
          console.log('AI Provider initialized: gemini');
          hasInitializedAny = true;
        }
      } catch (error) {
        console.error('Failed to initialize AI Provider "gemini":', error);
      }
    }
    
    // Mark the service as initialized if at least one provider was successfully initialized
    this.initialized = hasInitializedAny;
    
    return hasInitializedAny;
  }
  
  /**
   * Send a chat completion request to the active AI provider
   */
  public async chatCompletion(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    const provider = this.getActiveProvider();
    
    if (!provider) {
      throw new Error('No active AI provider set. Call setActiveProvider() first.');
    }
    
    // Try to initialize the provider if it's not already initialized
    if (!provider.isInitialized()) {
      if (this.activeProvider === 'openai') {
        if (!AI_CONFIG.openai.apiKey) {
          throw new Error('OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your environment variables.');
        }
        await provider.initialize(AI_CONFIG.openai);
      } else if (this.activeProvider === 'gemini') {
        if (!AI_CONFIG.gemini.apiKey) {
          throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your environment variables.');
        }
        await provider.initialize(AI_CONFIG.gemini);
      }
    }
    
    return provider.chatCompletion(messages, options);
  }

  /**
   * Generate vector embeddings for text using the active provider
   * @param text The text to generate embeddings for
   * @param options Request options for the embedding
   * @returns Promise resolving to embedding vector
   */
  public async createEmbedding(
    text: string,
    options?: EmbeddingRequestOptions
  ): Promise<EmbeddingResponse> {
    // Use OpenAI for embeddings as it's the most widely supported
    const provider = this.providers.get('openai');
    
    if (!provider) {
      throw new Error('OpenAI provider not found for embeddings generation.');
    }
    
    if (!provider.createEmbedding) {
      throw new Error('The selected provider does not support embeddings generation.');
    }
    
    // Try to initialize the provider if it's not already initialized
    if (!provider.isInitialized()) {
      if (!AI_CONFIG.openai.apiKey) {
        throw new Error('OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your environment variables.');
      }
      await provider.initialize(AI_CONFIG.openai);
    }
    
    return provider.createEmbedding(text, options);
  }
}

// Create the singleton instance
const aiService = AIService.getInstance();

// Initialize with the default provider from config
aiService.setActiveProvider(AI_CONFIG.defaultProvider);

// Initialize providers
aiService.initializeProviders().catch(error => {
  console.error('Failed to initialize AI providers:', error);
});

// Export the singleton instance
export { aiService };
