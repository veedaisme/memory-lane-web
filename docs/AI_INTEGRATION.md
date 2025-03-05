# AI Integration Documentation

Memory Lane includes a flexible AI integration service that supports multiple providers including OpenAI and Google Gemini. The implementation follows the Strategy pattern, making it easy to switch between different AI providers or add new ones in the future.

## Configuration

### Environment Variables

The application uses a centralized configuration approach. All configuration is managed through environment variables and accessed via the central configuration module.

1. Copy the environment variables from `.env.example` to a new `.env` file
2. Add your API keys for either OpenAI, Google Gemini, or both:
   ```
   # Default AI provider (openai or gemini)
   VITE_AI_DEFAULT_PROVIDER=openai
   
   # OpenAI Configuration
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_OPENAI_MODEL=gpt-3.5-turbo
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1  # Optional, for custom endpoints/proxies
   
   # Google Gemini Configuration
   VITE_GEMINI_API_KEY=your-gemini-api-key
   VITE_GEMINI_MODEL=gemini-pro
   
   # Feature Flags
   VITE_ENABLE_AI_TITLE_GENERATION=true
   ```

### Custom API Endpoints

The AI service supports custom API endpoints for OpenAI, which allows using alternative OpenAI-compatible APIs, self-hosted models, or proxies:

```typescript
// Configure a custom API endpoint for OpenAI
// In .env file:
VITE_OPENAI_BASE_URL=https://your-custom-endpoint.com/v1

// This will be available in the configuration:
const baseUrl = AI_CONFIG.openai.baseUrl; 
```

This is particularly useful for:
- Using OpenAI-compatible APIs like Azure OpenAI Service
- Setting up proxies to the OpenAI API
- Using self-hosted language models with OpenAI-compatible APIs
- Enterprise deployments with specific routing requirements

### Browser Environment Considerations

Since this application runs in a browser environment, the OpenAI provider uses the `dangerouslyAllowBrowser: true` option to function properly. This is necessary because the OpenAI SDK has a security mechanism that prevents API keys from being used directly in browser environments by default.

```typescript
// Configuration in OpenAIProvider
this.client = new OpenAI({
  apiKey,
  organization,
  baseURL,
  dangerouslyAllowBrowser: true // Required for browser environments
});
```

#### Security Recommendations

For production deployments, consider the following security approaches:

1. **Backend Proxy**: The recommended approach is to create a backend service that proxies requests to OpenAI, keeping the API key secure on the server side.
   
2. **Environment Variables**: For development or internal tools, using environment variables as implemented in this application provides a basic level of security.

3. **Auth-Protected Access**: Ensure that your application has proper authentication and authorization to prevent unauthorized access to AI features.

4. **API Key Rotation**: Regularly rotate API keys and implement proper access controls.

### Configuration Structure

The application uses a centralized configuration module located at `src/config/index.ts`. This provides:

- Single source of truth for all configuration
- Environment-specific defaults
- Configuration validation
- Type safety for configuration access

#### Property Naming Considerations

There is an important consideration regarding property naming in the OpenAI configuration:

1. Our configuration uses `baseUrl` (lowercase "url") to follow JavaScript naming conventions
2. The OpenAI SDK expects `baseURL` (uppercase "URL")

The provider implementation handles this mapping internally:

```typescript
// In our config (lowercase url)
export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL, // lowercase
  }
};

// In the OpenAI provider (mapping to uppercase URL)
if (baseUrl) clientConfig.baseURL = baseUrl; // Convert to the format expected by SDK
```

This allows us to maintain consistent naming conventions in our codebase while properly integrating with external libraries.

### Usage

```typescript
// Import the configuration
import { SUPABASE_CONFIG, AI_CONFIG, FEATURES } from '@/config';

// Access configuration values
const apiKey = AI_CONFIG.openai.apiKey;
const isTitleGenEnabled = FEATURES.enableAITitleGeneration;
```

## Architecture

The AI integration follows these design principles:

1. **Strategy Pattern**: Different AI providers implement a common interface
2. **Singleton Service**: A central service manages provider registration and selection
3. **Platform Agnostic**: Abstract away provider-specific implementation details
4. **React Integration**: Custom hook for easy use in React components
5. **Centralized Configuration**: All settings managed in one place with environment variables

## Directory Structure

```
src/
├── config/
│   └── index.ts           # Centralized configuration
├── integrations/
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── openai.provider.ts
│   │   │   └── gemini.provider.ts
│   │   ├── types.ts
│   │   ├── config.ts      # Re-exports from central config
│   │   ├── ai.service.ts
│   │   └── index.ts
├── hooks/
│   └── useAI.ts
├── utils/
│   └── titleGenerator.ts  # AI-powered title generation
```

## Usage Examples

### Basic Initialization

The AI service is automatically initialized at application startup with the default provider specified in the configuration:

```typescript
import { aiService } from '@/integrations/ai';

// The service is already initialized with the default provider
// from the configuration (VITE_AI_DEFAULT_PROVIDER)

// If needed, you can switch providers:
aiService.setActiveProvider('gemini');
```

### Using the React Hook

```tsx
import { useAI } from '@/hooks/useAI';

function AIChat() {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages 
  } = useAI({
    initialMessages: [
      { 
        role: 'system', 
        content: 'You are a helpful assistant for Memory Lane journal app.' 
      }
    ]
  });

  const handleSubmit = async (userInput: string) => {
    try {
      await sendMessage(userInput);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div>
      {/* Chat interface */}
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.content}
        </div>
      ))}
      
      {isLoading && <div>Loading...</div>}
      {error && <div className="error">{error.message}</div>}
      
      {/* Input form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
        handleSubmit(input.value);
        input.value = '';
      }}>
        <input name="message" disabled={isLoading} />
        <button type="submit" disabled={isLoading}>Send</button>
        <button type="button" onClick={clearMessages}>Clear Chat</button>
      </form>
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { aiService } from '@/integrations/ai';
import { ChatMessage } from '@/integrations/ai/types';

async function getAIResponse() {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What can you help me with?' }
  ];
  
  try {
    const response = await aiService.chatCompletion(messages, {
      maxTokens: 500,
      temperature: 0.7
    });
    
    console.log('AI Response:', response.text);
    return response.text;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}
```

### Feature-specific Usage: Title Generation

The application includes AI-powered title generation that can be enabled/disabled via configuration:

```typescript
import { generateTitleFromContent } from '@/utils/titleGenerator';

// Generate a title from note content
const title = await generateTitleFromContent("Today I went hiking in the mountains...");
// Returns: "Mountain Hiking Adventure"
```

## Adding a New Provider

To add a new AI provider:

1. Create a new provider implementation in `src/integrations/ai/providers/`
2. Implement the `AIProvider` interface
3. Register the provider in `AIService` constructor
4. Update the config file to include configuration for the new provider

Example:

```typescript
// 1. Update src/config/index.ts to include the new provider
export const AI_CONFIG = {
  defaultProvider: import.meta.env.VITE_AI_DEFAULT_PROVIDER || 'openai',
  openai: { 
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
    baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || undefined,
    /* ... */ 
  },
  gemini: { /* ... */ },
  newProvider: {
    apiKey: import.meta.env.VITE_NEW_PROVIDER_API_KEY || '',
    // other provider-specific config
  }
};

// 2. Create src/integrations/ai/providers/new-provider.ts
import { AIProvider, AIRequestOptions, AIResponse, ChatMessage } from '../types';

export class NewProvider implements AIProvider {
  public readonly id = 'newProvider';
  public readonly name = 'New AI Provider';
  
  // Implement all required methods...
}

// 3. Register in ai.service.ts constructor:
this.registerProvider('newProvider', new NewProvider());

// 4. Update the initialization method in ai.service.ts:
public async initializeProviders(): Promise<void> {
  // ... existing code
  
  // Initialize new provider
  const newProviderInstance = this.providers.get('newProvider');
  if (newProviderInstance) {
    try {
      await newProviderInstance.initialize(AI_CONFIG.newProvider);
      console.log('AI Provider initialized: newProvider');
    } catch (error) {
      console.error('Failed to initialize AI Provider "newProvider":', error);
    }
  }
}
