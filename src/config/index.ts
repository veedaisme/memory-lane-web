/**
 * Application Configuration
 * 
 * This file centralizes all configuration for the application.
 * All environment variables are accessed here to make it easier to:
 * 1. See what configuration options are available
 * 2. Provide fallbacks for development
 * 3. Add validation where needed
 * 4. Document the purpose of each configuration
 */

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_KEY 
};

// AI Service Configuration
export const AI_CONFIG = {
  // Default provider to use
  defaultProvider: import.meta.env.VITE_AI_DEFAULT_PROVIDER || 'openai',
  
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
    organization: import.meta.env.VITE_OPENAI_ORG || undefined,
    baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  
  // Google Gemini Configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro',
  }
};

// AI Application Defaults
export const AI_DEFAULTS = {
  maxTokens: 1000,
  temperature: 0.7,
  systemMessage: 'You are a helpful AI assistant for the Memory Lane journal app. Provide concise, accurate responses.',
  titleGeneration: {
    minContentLength: 75, // Minimum content length (in characters) required to generate a title
    fallbackTitle: 'Untitled Note',
  },
  tagGeneration: {
    minContentLength: 20, // Minimum content length (in characters) required to generate tags
    maxTags: 5, // Maximum number of AI-generated tags to add
  }
};

// Feature Flags
export const FEATURES = {
  enableAITitleGeneration: import.meta.env.VITE_ENABLE_AI_TITLE_GENERATION !== "false",
  enableAITagSuggestions: import.meta.env.VITE_ENABLE_AI_TAG_SUGGESTIONS !== "false",
  enableAIContentSummary: import.meta.env.VITE_ENABLE_AI_CONTENT_SUMMARY === "true",
};

// Environment detection
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

// Validate important config values
function validateConfig() {
  const warnings = [];

  // Check for missing Supabase config
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
    warnings.push('⚠️ Supabase environment variables not found. Using development fallback values.');
  }

  // Check for missing AI API keys if AI features are enabled
  if (FEATURES.enableAITitleGeneration || FEATURES.enableAITagSuggestions || FEATURES.enableAIContentSummary) {
    if (AI_CONFIG.defaultProvider === 'openai' && !AI_CONFIG.openai.apiKey) {
      warnings.push('⚠️ OpenAI API key not found but AI features are enabled.');
    }
    if (AI_CONFIG.defaultProvider === 'gemini' && !AI_CONFIG.gemini.apiKey) {
      warnings.push('⚠️ Gemini API key not found but AI features are enabled.');
    }
  }

  // Log all warnings
  warnings.forEach(warning => console.warn(warning));
}

// Run validation if not in production (avoid console logs in production)
if (ENV.isDevelopment) {
  validateConfig();
}

export default {
  supabase: SUPABASE_CONFIG,
  ai: AI_CONFIG,
  aiDefaults: AI_DEFAULTS,
  features: FEATURES,
  env: ENV,
};
