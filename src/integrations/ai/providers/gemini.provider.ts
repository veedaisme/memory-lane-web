import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
  AIProvider,
  AIRequestOptions,
  AIResponse,
  ChatMessage
} from '../types';

/**
 * Gemini-specific configuration options
 */
export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

/**
 * Implementation of the AI provider strategy for Google's Gemini
 */
export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini';
  
  private client: GoogleGenerativeAI | null = null;
  private defaultModel = 'gemini-pro';
  private model: string;
  
  constructor(config?: GeminiConfig) {
    this.model = config?.model || this.defaultModel;
    if (config) {
      this.initialize(config);
    }
  }
  
  /**
   * Initialize the Gemini client with API key and configuration
   */
  public initialize(config: GeminiConfig): void {
    const { apiKey, model } = config;
    
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.client = new GoogleGenerativeAI(apiKey);
    
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
   * Send a chat completion request to Gemini
   */
  public async chatCompletion(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    if (!this.isInitialized()) {
      throw new Error('Gemini provider not initialized. Call initialize() first.');
    }
    
    try {
      const geminiModel = this.client!.getGenerativeModel({ model: this.model });
      
      // Configure the safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];
      
      // Create a chat session
      const chat = geminiModel.startChat({
        safetySettings,
        generationConfig: {
          maxOutputTokens: options?.maxTokens,
          temperature: options?.temperature,
          stopSequences: options?.stopSequences,
        },
      });
      
      // Format messages for Gemini
      const history: { role: 'user' | 'model', parts: string }[] = [];
      
      // Separate out system message if present
      let systemMessage: string | undefined;
      
      // Process messages to handle system messages and build chat history
      for (const message of messages) {
        if (message.role === 'system') {
          // Store system message to prepend to the first user message
          systemMessage = message.content;
        } else if (message.role === 'user') {
          // For user messages, prepend system message to the first one if it exists
          const content = systemMessage && history.length === 0 
            ? `${systemMessage}\n\n${message.content}` 
            : message.content;
          
          history.push({ role: 'user', parts: content });
          
          // Clear system message after using it
          systemMessage = undefined;
        } else if (message.role === 'assistant') {
          history.push({ role: 'model', parts: message.content });
        }
      }
      
      // Send the last user message for completion
      const lastUserMessage = history.find(msg => msg.role === 'user')?.parts || '';
      const result = await chat.sendMessage(lastUserMessage);
      const response = result.response;
      
      return {
        text: response.text(),
        // Gemini doesn't provide token usage information in the same way
        usage: {
          totalTokens: undefined
        }
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred with Gemini';
      console.error(`Gemini API error: ${errorMessage}`);
      throw new Error(`Gemini error: ${errorMessage}`);
    }
  }
}
