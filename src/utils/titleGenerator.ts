import { aiService } from '../integrations/ai';
import { ChatMessage } from '../integrations/ai/types';
import { AI_DEFAULTS, FEATURES } from '@/config';

/**
 * Generate a title for a note using AI based on its content
 * 
 * @param content The note content to generate a title for
 * @returns A promise that resolves to a generated title
 */
export async function generateTitleFromContent(content: string): Promise<string> {
  // Check if AI title generation is enabled in config
  if (!FEATURES.enableAITitleGeneration) {
    console.log('AI title generation is disabled by configuration');
    return createFallbackTitle(content);
  }

  try {
    // Get the active AI provider
    const activeProvider = aiService.getActiveProvider();
    
    // If no provider is available or initialized, use fallback
    if (!activeProvider) {
      console.warn('No active AI provider found, using fallback title');
      return createFallbackTitle(content);
    }
    
    // Check if the provider is initialized
    if (!activeProvider.isInitialized()) {
      console.log('Attempting to initialize AI provider for title generation...');
      
      try {
        // Try to initialize the provider
        await aiService.initializeProviders();
        
        // Double-check initialization status
        if (!activeProvider.isInitialized()) {
          console.warn('Failed to initialize AI provider, using fallback title');
          return createFallbackTitle(content);
        }
      } catch (error) {
        console.warn('Error initializing AI provider:', error);
        return createFallbackTitle(content);
      }
    }

    // Create messages for the AI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates concise, meaningful titles for notes. ' +
                 'Create a title that captures the essence of the note in 5-7 words maximum. ' +
                 'The title should be specific to the content, not generic. Do not use quotes around the title. ' +
                 'Respond with ONLY the title text and nothing else.'
      },
      {
        role: 'user',
        content: `Generate a short, specific title for this note: "${content}"`
      }
    ];

    // Send to AI service
    const response = await aiService.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 30
    });

    // Clean up the response (remove quotes, trim)
    let title = response.text.trim();
    title = title.replace(/^["']|["']$/g, ''); // Remove leading/trailing quotes if present
    
    // If the title is too long, truncate it
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    return title || createFallbackTitle(content);
  } catch (error) {
    console.error('Error generating title:', error);
    return createFallbackTitle(content);
  }
}

/**
 * Create a fallback title from content when AI is unavailable
 * 
 * @param content The note content
 * @returns A simple title based on the first few words
 */
function createFallbackTitle(content: string): string {
  const trimmedContent = content.trim();
  
  // Use first few words (up to 40 chars) as the title
  const words = trimmedContent.split(' ');
  let title = '';
  
  for (const word of words) {
    if ((title + ' ' + word).length <= 40) {
      title += (title ? ' ' : '') + word;
    } else {
      break;
    }
  }
  
  return title + (title.length < trimmedContent.length ? '...' : '');
}
