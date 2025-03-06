import { aiService } from '../integrations/ai';
import { ChatMessage } from '../integrations/ai/types';
import { AI_DEFAULTS, FEATURES } from '@/config';

/**
 * Generate tags for a note based on its content
 * Always produces tags in English regardless of note language
 * 
 * @param content The note content to generate tags for
 * @param title The note title (optional, for better context)
 * @param existingTags User-created tags to preserve
 * @returns A promise that resolves to an array of tags
 */
export async function generateTagsFromContent(
  content: string, 
  title: string = '', 
  existingTags: string[] = []
): Promise<string[]> {
  // Check if AI tag suggestions are enabled in config
  if (!FEATURES.enableAITagSuggestions) {
    console.log('AI tag suggestions are disabled by configuration');
    return existingTags;
  }

  // Check if content is too short for meaningful AI tag generation
  const minContentLength = AI_DEFAULTS.tagGeneration?.minContentLength || 20;
  if (content.trim().length < minContentLength) {
    console.log(`Content too short for AI tag generation (${content.trim().length} chars < ${minContentLength} min chars)`);
    return existingTags;
  }

  try {
    // Get the active AI provider
    const activeProvider = aiService.getActiveProvider();
    
    // If no provider is available or initialized, use existing tags only
    if (!activeProvider) {
      console.warn('No active AI provider found, using existing tags only');
      return existingTags;
    }
    
    // Check if the provider is initialized
    if (!activeProvider.isInitialized()) {
      console.log('Attempting to initialize AI provider for tag generation...');
      
      try {
        // Try to initialize the provider
        await aiService.initializeProviders();
        
        // Double-check initialization status
        if (!activeProvider.isInitialized()) {
          console.warn('Failed to initialize AI provider, using existing tags only');
          return existingTags;
        }
      } catch (error) {
        console.warn('Error initializing AI provider:', error);
        return existingTags;
      }
    }

    // Create system prompt (simplified without language detection)
    const systemPrompt = 
      'You are a helpful assistant that generates relevant tags for note content. ' +
      'Create 3-5 concise, single-word or short phrase tags that accurately represent the key topics in the note. ' +
      'Tags should be in English even if the content is in another language. ' +
      'Respond with ONLY the tags, separated by commas, and nothing else. ' +
      'Do not use quotes or bullet points. Keep tags lowercase unless they are proper nouns.';

    // Create messages for the AI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Generate relevant English-language tags for this note${title ? ' with title: "' + title + '"' : ''}: "${content}"`
      }
    ];

    // Send to AI service
    const response = await aiService.chatCompletion(messages, {
      temperature: 0.5,
      maxTokens: 50
    });

    // Parse the response: remove quotes, split by commas, trim whitespace
    const aiTags = response.text
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .split(',')
      .map(tag => tag.trim().toLowerCase()) // Ensure all AI tags are lowercase
      .filter(tag => tag.length > 0);

    console.log('AI suggested tags:', aiTags);
    
    // Merge AI tags with existing tags, removing duplicates
    // Convert all tags to lowercase for case-insensitive comparison
    const existingTagsLower = existingTags.map(tag => tag.toLowerCase());
    
    // Filter out AI tags that already exist (case-insensitive)
    const newTags = aiTags.filter(tag => {
      // Check if this tag or any variation of it already exists
      return !existingTagsLower.some(existingTag => 
        existingTag === tag || 
        existingTag.replace(/\s+/g, '') === tag.replace(/\s+/g, '') || // Compare without spaces
        existingTag.replace(/[-_\s]+/g, '') === tag.replace(/[-_\s]+/g, '') // Compare without separators
      );
    });
    
    console.log('After duplicate removal:', newTags);
    
    // Limit the number of AI-generated tags to add
    const maxTags = AI_DEFAULTS.tagGeneration?.maxTags || 5;
    const limitedNewTags = newTags.slice(0, maxTags);
    
    return [...existingTags, ...limitedNewTags];
  } catch (error) {
    console.error('Error generating tags:', error);
    // If AI tagging fails, just return the existing tags
    return existingTags;
  }
} 