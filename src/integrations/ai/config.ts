/**
 * AI service configuration
 * 
 * In a production environment, these values should be loaded
 * from environment variables or a secure configuration store.
 */

// API Provider configuration
export const AI_CONFIG = {
  // Default provider to use
  defaultProvider: 'openai' as const,
  
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
    organization: import.meta.env.VITE_OPENAI_ORG || undefined,
  },
  
  // Google Gemini Configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro',
  }
};

// Application defaults for AI requests
export const AI_DEFAULTS = {
  maxTokens: 1000,
  temperature: 0.7,
  systemMessage: 'You are a helpful AI assistant for the Memory Lane journal app. Provide concise, accurate responses.'
};
