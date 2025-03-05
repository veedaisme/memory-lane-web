# Centralized Configuration

This directory contains the centralized configuration system for Thoughtscape Journal. All application configuration should be managed through this module rather than scattered across individual files.

## Design Principles

The configuration system follows these principles:

1. **Single Source of Truth**: All configuration is centralized in this module
2. **Environment Variables**: Configuration values are loaded from environment variables
3. **Sensible Defaults**: Fallback values are provided for development
4. **Validation**: Configuration is validated to detect issues early
5. **Documentation**: Configuration options are well-documented

## File Structure

- `index.ts`: Main configuration file that exports all configuration objects

## Usage

Import configuration from this module:

```typescript
// Import specific configuration objects
import { SUPABASE_CONFIG, AI_CONFIG, FEATURES } from '@/config';

// Or import the default export
import config from '@/config';
const { supabase, ai, features } = config;
```

## Adding New Configuration

When adding new configuration options:

1. Add the environment variable to `.env.example`
2. Add the configuration to the appropriate section in `index.ts`
3. Add validation if necessary
4. Update documentation

## Security Considerations

- Never commit sensitive values (API keys, secrets) to the repository
- Always use environment variables for sensitive configuration
- In production, ensure all required environment variables are set
