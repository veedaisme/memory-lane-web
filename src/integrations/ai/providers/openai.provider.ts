import OpenAI from 'openai';
import {
  AIProvider,
  AIRequestOptions,
  AIResponse,
  ChatMessage
} from '../types';

/**
 * OpenAI-specific configuration options
 */
export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  model?: string;
  baseURL?: string;
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
    const { apiKey, organization, model, baseURL } = config;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.client = new OpenAI({
      apiKey,
      organization,
      baseURL
    });
    
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
