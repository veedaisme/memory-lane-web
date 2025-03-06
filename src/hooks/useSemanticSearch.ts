import { useState } from 'react';
import { searchSimilarNotes } from '@/utils/embeddingUtils';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

export interface UseSemanticSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, threshold?: number, limit?: number) => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook for performing semantic searches on notes
 * Encapsulates semantic search functionality for components
 */
export function useSemanticSearch(): UseSemanticSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, threshold = 0.7, limit = 10): Promise<void> => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchSimilarNotes(query, threshold, limit);
      setResults(searchResults);
    } catch (err: any) {
      console.error('Semantic search error:', err);
      setError(err.message || 'An error occurred during search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}

export default useSemanticSearch;
