
import OpenAI from 'openai';
import {
  AIProvider,
  AIRequestOptions,
  AIResponse,
  ChatMessage,
  EmbeddingRequestOptions,
  EmbeddingResponse
} from '../types';

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider implements AIProvider {
  public readonly id = 'openai';
  public readonly name = 'OpenAI';
  
  private client: OpenAI | null = null;
  private defaultModel: string = 'gpt-4o-mini';
  private embeddingModel: string = 'text-embedding-3-small';
  private initialized: boolean = false;
  
  /**
   * Initialize the OpenAI provider with API key and optional organization
   */
  initialize(config: Record<string, unknown>): void {
    // Check for required configuration
    const apiKey = config.apiKey as string;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    // Extract optional configuration
    const organization = config.organization as string;
    const baseUrl = config.baseUrl as string;
    const model = config.model as string;
    
    // Set default model if provided
    if (model) {
      this.defaultModel = model;
    }
    
    // Configure client
    const clientConfig: OpenAI.ClientOptions = {
      apiKey,
    };
    
    // Add optional configuration if provided
    if (organization) clientConfig.organization = organization;
    if (baseUrl) clientConfig.baseURL = baseUrl;
    
    // Required for browser environments
    clientConfig.dangerouslyAllowBrowser = true;
    
    // Create the client
    this.client = new OpenAI(clientConfig);
    this.initialized = true;
  }
  
  /**
   * Check if the provider is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.client !== null;
  }
  
  /**
   * Convert messages to OpenAI format
   */
  private convertMessages(messages: ChatMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
  
  /**
   * Send a chat completion request to OpenAI
   */
  async chatCompletion(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    if (!this.isInitialized()) {
      throw new Error('OpenAI provider not initialized');
    }
    
    // Extract options with defaults
    const maxTokens = options?.maxTokens || undefined;
    const temperature = options?.temperature ?? 0.7;
    const stopSequences = options?.stopSequences || undefined;
    
    try {
      const response = await this.client!.chat.completions.create({
        model: this.defaultModel,
        messages: this.convertMessages(messages),
        max_tokens: maxTokens,
        temperature,
        stop: stopSequences
      });
      
      // Extract the response text
      const text = response.choices[0]?.message?.content || '';
      
      // Extract usage if available
      const usage = response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined;
      
      return { text, usage };
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Generate vector embeddings for text
   */
  async createEmbedding(
    text: string,
    options?: EmbeddingRequestOptions
  ): Promise<EmbeddingResponse> {
    if (!this.isInitialized()) {
      throw new Error('OpenAI provider not initialized');
    }
    
    // Use the specified model or default to text-embedding-3-small
    const model = options?.model || this.embeddingModel;
    
    try {
      const response = await this.client!.embeddings.create({
        model,
        input: text,
        dimensions: options?.dimensions
      });
      
      // Extract the first embedding (we only sent one input)
      const embedding = response.data[0]?.embedding || [];
      
      // Extract usage if available
      const usage = response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined;
      
      return { embedding, usage };
    } catch (error: any) {
      console.error('OpenAI Embedding API Error:', error);
      throw new Error(`OpenAI Embedding API Error: ${error.message || 'Unknown error'}`);
    }
  }
}
