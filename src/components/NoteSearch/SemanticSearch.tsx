import React, { useState } from 'react';
import { searchSimilarNotes } from '@/utils/embeddingUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

interface SemanticSearchProps {
  onSelectNote?: (noteId: string) => void;
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({ onSelectNote }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchSimilarNotes(query);
      setResults(searchResults);
    } catch (error: unknown) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };
  
  // Format similarity score as percentage
  const formatSimilarity = (similarity: number): string => {
    return `${Math.round(similarity * 100)}%`;
  };
  
  // Truncate content for preview
  const truncateContent = (content: string, maxLength = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for notes by meaning, not just keywords..."
          className="flex-1"
          aria-label="Semantic search query"
        />
        <Button 
          onClick={handleSearch} 
          disabled={loading || !query.trim()}
          aria-label="Search notes"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-3" role="region" aria-label="Search results">
        {results.length === 0 && query && !loading && !error && (
          <p className="text-center text-gray-500 py-4">No matching notes found</p>
        )}
        
        {results.map((result) => (
          <Card key={result.id} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="mr-2">{result.title}</CardTitle>
                <Badge variant="outline">{formatSimilarity(result.similarity)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-muted-foreground">{truncateContent(result.content)}</p>
            </CardContent>
            <CardFooter className="flex justify-between pt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSelectNote && onSelectNote(result.id)}
                aria-label={`View note: ${result.title}`}
              >
                View Note
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SemanticSearch;
