import { aiService } from '@/integrations/ai';
import { Note } from '@/context/NoteContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate an embedding for the content of a note
 * This combines the title and content to create a comprehensive embedding
 * 
 * @param note The note to generate an embedding for
 * @returns The embedding vector 
 */
export const generateNoteEmbedding = async (note: Pick<Note, 'title' | 'content'>): Promise<number[]> => {
  try {
    // Check if OpenAI API key is configured properly
    const { AI_CONFIG } = await import('@/config');
    if (!AI_CONFIG.openai.apiKey) {
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is missing. Please check your environment variables.');
    }
    
    // Combine title and content for a more comprehensive embedding
    const text = `${note.title}\n\n${note.content}`;
    console.log('Generating embedding for text:', {
      textLength: text.length,
      titleLength: note.title.length,
      contentLength: note.content.length
    });
    
    // Generate embedding using OpenAI
    const { embedding } = await aiService.generateEmbedding(text);
    
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Generated embedding is invalid or empty');
    }
    
    console.log('Successfully generated embedding:', {
      embeddingLength: embedding.length,
      embeddingSample: embedding.slice(0, 3) // Just log the first few values
    });
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Store an embedding for a note in the database
 * 
 * @param noteId The ID of the note
 * @param embedding The embedding vector
 */
export const storeNoteEmbedding = async (noteId: string, embedding: number[]): Promise<void> => {
  try {
    console.log(`Storing embedding for note ${noteId}:`, { 
      embeddingLength: embedding.length,
      sampleValues: embedding.slice(0, 3) // Log just a few values for debugging
    });
    
    // Validate embeddings to ensure they're in the correct format
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding format: Embedding must be a non-empty array');
    }
    
    if (embedding.some(value => typeof value !== 'number')) {
      throw new Error('Invalid embedding format: All values must be numbers');
    }
    
    const { data, error } = await supabase
      .from('notes')
      .update({ embedding })
      .eq('id', noteId)
      .select('id');
      
    if (error) {
      console.error('Error storing embedding:', error);
      throw new Error(`Failed to store embedding: ${error.message}`);
    }
    
    console.log(`Successfully stored embedding for note ${noteId}:`, data);
  } catch (error) {
    console.error('Error in storeNoteEmbedding:', error);
    throw error;
  }
};

/**
 * Search for notes similar to a query using embeddings
 * 
 * @param query The search query text
 * @param threshold Similarity threshold (0-1)
 * @param limit Maximum number of results to return
 * @returns Array of matching notes with similarity scores
 */
export const searchSimilarNotes = async (
  query: string, 
  threshold = 0.7, 
  limit = 10
): Promise<Array<{ id: string, title: string, content: string, similarity: number }>> => {
  try {
    // Generate embedding for query text
    const { embedding } = await aiService.generateEmbedding(query);
    
    // Call the PostgreSQL function to find similar notes
    const { data, error } = await supabase.rpc(
      'match_notes', 
      { 
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit
      }
    );
    
    if (error) {
      console.error('Error searching similar notes:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchSimilarNotes:', error);
    throw error;
  }
};

/**
 * Checks if a note already has an embedding
 * 
 * @param noteId The ID of the note to check
 * @returns boolean indicating if the note has an embedding
 */
export const hasEmbedding = async (noteId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('embedding')
      .eq('id', noteId)
      .single();
      
    if (error) {
      console.error('Error checking for embedding:', error);
      return false;
    }
    
    return !!data.embedding;
  } catch (error) {
    console.error('Error in hasEmbedding:', error);
    return false;
  }
};
