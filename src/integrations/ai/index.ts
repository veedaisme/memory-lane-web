// Export types
export * from './types';

// Export providers
export { OpenAIProvider } from './providers/openai.provider';
export { GeminiProvider } from './providers/gemini.provider';

// Export service and config
export { AIService, aiService } from './ai.service';
export { AI_CONFIG, AI_DEFAULTS } from './config';

// Export a convenience function to initialize the AI service
import { aiService } from './ai.service';
import { AI_CONFIG } from './config';

/**
 * Initialize the AI service with the default provider from config
 * This is a convenience function that can be called at app startup
 * @returns A promise that resolves when initialization is complete
 */
export async function initializeAIService(): Promise<boolean> {
  const defaultProvider = AI_CONFIG.defaultProvider;
  
  try {
    // Set the active provider
    aiService.setActiveProvider(defaultProvider);
    
    // Initialize all providers
    const initializationResult = await aiService.initializeProviders();
    
    if (initializationResult) {
      console.log(`AI service initialized with ${defaultProvider} provider.`);
    } else {
      console.warn(`AI service failed to initialize any providers. AI features may be unavailable.`);
    }
    
    return initializationResult;
  } catch (error) {
    console.error('Failed to initialize AI service:', error);
    return false;
  }
}
