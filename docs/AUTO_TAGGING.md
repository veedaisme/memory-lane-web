# Auto-Tagging Feature Documentation

Memory Lane includes an intelligent auto-tagging system that automatically generates relevant tags for notes based on their content. This feature enhances organization and searchability while reducing the cognitive load on users.

## Overview

The auto-tagging system uses AI to analyze the content of notes and generate relevant tags that capture the key topics, concepts, and themes. These AI-generated tags complement any tags that users manually add, resulting in comprehensive tagging with minimal user effort.

A key feature of the auto-tagging system is that it always generates English tags regardless of the note's language, ensuring consistency across the application.

## How It Works

1. **Content Analysis**: The system sends note content to the configured AI provider (OpenAI or Google Gemini).
2. **Tag Generation**: The AI generates 3-5 relevant tags that capture the key topics of the note in English, regardless of the original content language.
3. **Tag Merging**: AI-generated tags are combined with any user-created tags, ensuring no duplicates.
4. **English Consistency**: Tags are always generated in English, even for content in other languages, ensuring a consistent tagging system.

## Implementation Details

The auto-tagging feature is implemented across several components:

### 1. Tag Generator Utility

Located at `src/utils/tagGenerator.ts`, this utility is responsible for:
- Calling the AI service to generate tags
- Merging AI-generated tags with user-created tags
- Ensuring tags are relevant and non-duplicative
- Limiting the number of AI-generated tags to prevent tag overload

### 2. AI Integration

The tag generator leverages the existing AI service infrastructure:
- Uses the Strategy pattern to work with multiple AI providers
- Follows the same initialization and fallback patterns as other AI features
- Relies on the LLM's built-in language understanding capabilities

### 3. Note Context Integration

The auto-tagging feature is seamlessly integrated into the note creation and update flows:
- When creating a note, tags are automatically generated based on note content
- When updating a note's content, tags are regenerated to reflect the updated content
- User-created tags are always preserved during auto-tagging

## Configuration

The auto-tagging feature can be configured through environment variables and application settings:

### Environment Variables

```
# Enable or disable AI tag suggestions
VITE_ENABLE_AI_TAG_SUGGESTIONS=true
```

### Configuration Options

In `src/config/index.ts`:

```typescript
export const AI_DEFAULTS = {
  // ... other configuration
  tagGeneration: {
    minContentLength: 20, // Minimum content length for tag generation
    maxTags: 5,          // Maximum number of AI-generated tags to add
  }
};
```

## Multi-Language Support

The auto-tagging system works with content in multiple languages:

1. **Language Agnostic**: The system relies on the AI model's built-in language detection capabilities.
2. **Semantic Understanding**: For non-English content, the AI understands the semantic meaning and generates appropriate English tags.
3. **English Tag Output**: Regardless of input language, tags are always output in English for consistency.

## Privacy and Processing

All auto-tagging processing happens through the configured AI provider:

1. **API Keys**: Requires valid API keys for either OpenAI or Google Gemini
2. **Offline Operation**: If AI services are unavailable, the system gracefully falls back to using only user-created tags
3. **Asynchronous Processing**: Tag generation happens in the background without blocking the UI

## Additional Benefits

The auto-tagging system provides several benefits:

1. **Reduced Cognitive Load**: Users don't need to think about appropriate tags for every note
2. **Consistent Organization**: Similar content gets similar tags, improving organization
3. **Enhanced Searchability**: More comprehensive tagging improves content discovery
4. **Cross-Language Search**: English tags for all content enables consistent search across languages
5. **Accessibility**: Reduces the effort required to organize content, benefiting all users 