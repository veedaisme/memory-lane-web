# AI Integration Documentation

Memory Lane includes a flexible AI integration service that supports multiple providers including OpenAI and Google Gemini. The implementation follows the Strategy pattern, making it easy to switch between different AI providers or add new ones in the future.

## Setup

1. Copy the environment variables from `.env.example` to a new `.env` file
2. Add your API keys for either OpenAI, Google Gemini, or both:
   ```
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

## Architecture

The AI integration follows these design principles:

1. **Strategy Pattern**: Different AI providers implement a common interface
2. **Singleton Service**: A central service manages provider registration and selection
3. **Platform Agnostic**: Abstract away provider-specific implementation details
4. **React Integration**: Custom hook for easy use in React components

## Directory Structure

```
src/
├── integrations/
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── openai.provider.ts
│   │   │   └── gemini.provider.ts
│   │   ├── types.ts
│   │   ├── config.ts
│   │   ├── ai.service.ts
│   │   └── index.ts
├── hooks/
│   └── useAI.ts
```

## Usage Examples

### Basic Initialization

Initialize the AI service at application startup:

```typescript
import { initializeAIService } from './integrations/ai';

// In your app initialization
initializeAIService();
```

### Manually Selecting a Provider

```typescript
import { aiService } from './integrations/ai';

// Use OpenAI
aiService.useProvider('openai', {
  apiKey: 'your-openai-api-key',
  model: 'gpt-4'
});

// Or use Gemini
aiService.useProvider('gemini', {
  apiKey: 'your-gemini-api-key'
});
```

### Using the React Hook

```tsx
import { useAI } from './hooks/useAI';

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
import { aiService, ChatMessage } from './integrations/ai';

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

## Adding a New Provider

To add a new AI provider:

1. Create a new provider implementation in `src/integrations/ai/providers/`
2. Implement the `AIProvider` interface
3. Register the provider in `AIService` constructor
4. Update the config file with the new provider settings

Example:

```typescript
// src/integrations/ai/providers/my-provider.ts
import { AIProvider, AIRequestOptions, AIResponse, ChatMessage } from '../types';

export class MyCustomProvider implements AIProvider {
  public readonly id = 'custom';
  public readonly name = 'My Custom AI';
  
  // Implement all required methods...
}

// In ai.service.ts constructor:
this.registerProvider(new MyCustomProvider());
```
