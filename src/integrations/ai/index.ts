// Export types
export * from './types';

// Export providers
export { OpenAIProvider } from './providers/openai.provider';
export { GeminiProvider } from './providers/gemini.provider';

// Export service and config
export { AIService, aiService, AIProviderType } from './ai.service';
export { AI_CONFIG, AI_DEFAULTS } from './config';

// Export a convenience function to initialize the AI service
import { aiService } from './ai.service';
import { AI_CONFIG } from './config';

/**
 * Initialize the AI service with the default provider from config
 * This is a convenience function that can be called at app startup
 */
export function initializeAIService(): void {
  const defaultProvider = AI_CONFIG.defaultProvider;
  
  try {
    if (defaultProvider === 'openai') {
      aiService.useProvider('openai', AI_CONFIG.openai);
    } else if (defaultProvider === 'gemini') {
      aiService.useProvider('gemini', AI_CONFIG.gemini);
    } else {
      console.warn(`Unknown default AI provider: ${defaultProvider}`);
    }
    
    console.log(`AI service initialized with ${defaultProvider} provider.`);
  } catch (error) {
    console.error('Failed to initialize AI service:', error);
  }
}
