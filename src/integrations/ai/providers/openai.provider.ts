import OpenAI from 'openai';
import {
  AIProvider,
  AIRequestOptions,
  AIResponse,
  ChatMessage
} from '../types';

/**
 * OpenAI-specific configuration options
 * Note: We use baseUrl (lowercase URL) to match our config convention,
 * but the OpenAI SDK expects baseURL (uppercase URL)
 */
export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  model?: string;
  baseUrl?: string; // Our config uses lowercase 'url'
}

/**
 * Implementation of the AI provider strategy for OpenAI
 */
export class OpenAIProvider implements AIProvider {
  public readonly id = 'openai';
  public readonly name = 'OpenAI';
  
  private client: OpenAI | null = null;
  private defaultModel = 'gpt-3.5-turbo';
  private model: string;
  
  constructor(config?: OpenAIConfig) {
    this.model = config?.model || this.defaultModel;
    if (config) {
      this.initialize(config);
    }
  }
  
  /**
   * Initialize the OpenAI client with API key and configuration
   */
  public initialize(config: OpenAIConfig): void {
    const { apiKey, organization, model, baseUrl } = config;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    // Log the configuration for debugging
    console.log('Initializing OpenAI provider with:', {
      apiKey: apiKey ? '(set)' : '(not set)',
      organization: organization || '(not set)',
      model: model || this.defaultModel,
      baseUrl: baseUrl || '(default)'
    });
    
    // Create the OpenAI client with the proper configuration
    // Note: OpenAI SDK expects baseURL with uppercase URL
    const clientConfig: any = {
      apiKey,
      dangerouslyAllowBrowser: true // Required for browser environments
    };
    
    // Only add defined properties
    if (organization) clientConfig.organization = organization;
    if (baseUrl) clientConfig.baseURL = baseUrl; // Convert to uppercase URL format expected by SDK
    
    // Create the client with our properly mapped config
    this.client = new OpenAI(clientConfig);
    
    if (model) {
      this.model = model;
    }
  }
  
  /**
   * Check if the provider has been initialized with API key
   */
  public isInitialized(): boolean {
    return this.client !== null;
  }
  
  /**
   * Convert generic chat messages to OpenAI-specific format
   */
  private mapMessages(messages: ChatMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map(message => ({
      role: message.role,
      content: message.content
    }));
  }
  
  /**
   * Send a chat completion request to OpenAI
   */
  public async chatCompletion(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    if (!this.isInitialized()) {
      throw new Error('OpenAI provider not initialized. Call initialize() first.');
    }
    
    try {
      // Log request details for debugging
      console.log('Sending OpenAI request to model:', this.model);
      
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: this.mapMessages(messages),
        max_tokens: options?.maxTokens,
        temperature: options?.temperature,
        stop: options?.stopSequences,
      });
      
      const responseMessage = response.choices[0].message;
      
      return {
        text: responseMessage.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens
        }
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred with OpenAI';
      console.error(`OpenAI API error: ${errorMessage}`);
      throw new Error(`OpenAI error: ${errorMessage}`);
    }
  }
}
