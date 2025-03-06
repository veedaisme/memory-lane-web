
import { aiService } from '../integrations/ai';
import { EmbeddingRequestOptions } from '../integrations/ai/types';
import { AI_DEFAULTS, FEATURES } from '@/config';

/**
 * Generate embedding vector for note content
 * 
 * @param content The note content to generate an embedding for
 * @returns A promise that resolves to a vector embedding array
 */
export async function generateEmbeddingFromContent(content: string): Promise<number[] | null> {
  // Check if note embeddings are enabled in config
  if (!FEATURES.enableNoteEmbeddings) {
    console.log('Note embeddings are disabled by configuration');
    return null;
  }

  // Validate input
  if (!content || content.trim().length === 0) {
    console.log('Content is empty, skipping embedding generation');
    return null;
  }

  try {
    // Use the embedding model specified in configuration
    const options: EmbeddingRequestOptions = {
      model: AI_DEFAULTS.embedding.model,
      dimensions: AI_DEFAULTS.embedding.dimensions
    };

    // Generate the embedding
    const response = await aiService.createEmbedding(content.trim(), options);
    
    console.log(`Embedding generated successfully with ${response.embedding.length} dimensions`);
    
    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}
