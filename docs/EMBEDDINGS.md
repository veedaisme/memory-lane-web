# Note Embeddings Documentation

This document outlines the implementation of vector embeddings for notes in Memory Lane, which enables powerful semantic search capabilities.

## Overview

Memory Lane uses OpenAI's `text-embedding-3-small` model to generate high-quality 1536-dimensional embeddings for notes. These embeddings are stored in Supabase using the pgvector extension, allowing for efficient similarity searches.

## Technical Architecture

### Embedding Model

- **Model**: OpenAI's `text-embedding-3-small`
- **Dimensions**: 1536
- **Quality**: High-quality embeddings with strong performance for semantic similarity
- **Cost**: Approximately $0.02 per 1M tokens

### Storage

- **Database**: Supabase PostgreSQL with pgvector extension
- **Column Type**: `vector(1536)` in the `notes` table
- **Indexing**: Using IVFFLAT index for fast approximate nearest neighbor searches

### Search Algorithm

- **Similarity Metric**: Cosine similarity between vectors
- **Query Process**: The search query is converted to an embedding, then compared against all note embeddings
- **Result Ranking**: Notes are ranked by similarity score (higher is better)

## Implementation Details

### Database Schema

The `notes` table includes an `embedding` column:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE notes ADD COLUMN embedding vector(1536);
CREATE INDEX ON notes USING ivfflat (embedding vector_cosine_ops);
```

### Similarity Search Function

A PostgreSQL function finds notes similar to a given query embedding:

```sql
CREATE OR REPLACE FUNCTION match_notes(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE(id text, title text, content text, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    notes.id,
    notes.title,
    notes.content,
    1 - (notes.embedding <=> query_embedding) as similarity
  FROM notes
  WHERE 1 - (notes.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

### Embedding Generation Process

1. When a note is created or updated, the system combines the title and content.
2. This text is sent to OpenAI's embedding API.
3. The resulting embedding vector is stored in the database.
4. This process happens asynchronously to avoid blocking the UI.

### Code Structure

- `src/utils/embeddingUtils.ts`: Core utility functions for embedding operations
- `src/hooks/useSemanticSearch.ts`: React hook for easy integration in components
- `src/components/NoteSearch/SemanticSearch.tsx`: UI component for semantic search
- `src/integrations/ai/providers/openai.provider.ts`: Implementation of embedding generation

## Usage

### Generating Embeddings

Embeddings are automatically generated when:
- A new note is created
- An existing note's title or content is updated

The process is transparent to users and happens in the background.

### Searching with Embeddings

The `useSemanticSearch` hook provides a simple interface for components:

```typescript
const { results, loading, error, search } = useSemanticSearch();

// Perform a search
await search("concept or idea to search for");

// Results contain matches with similarity scores
console.log(results); // [{ id, title, content, similarity }, ...]
```

### Customizing Search Parameters

The search function accepts optional parameters:

```typescript
search(query, threshold, limit);
```

- `query`: The search text
- `threshold`: Minimum similarity score (0-1), default: 0.7
- `limit`: Maximum number of results, default: 10

## Performance Considerations

- Embedding generation is computationally intensive but happens asynchronously
- The pgvector index optimizes search performance
- For large databases, consider:
  - Increasing the threshold to reduce the number of results
  - Using batched processing for bulk operations
  - Implementing pagination for result displays

## Accessibility Implications

The semantic search functionality enhances accessibility by:

1. Allowing users to find content based on concepts rather than exact keywords
2. Reducing cognitive load by removing the need to remember precise terms
3. Supporting users with varying language skills and memory capabilities

This aligns with Memory Lane's core design principle of "Accessibility as Foundation."

## Future Improvements

Potential enhancements to the embedding system:

1. Implement hybrid search (combining full-text and vector search)
2. Add support for filtering by tags, dates, or locations alongside semantic search
3. Explore real-time embedding updates with WebSockets
4. Add visualization of related notes in a concept map
5. Implement progressive loading of search results for better performance
