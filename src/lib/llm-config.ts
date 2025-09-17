import { createOpenAI } from '@ai-sdk/openai';

// Get environment variables - use import.meta.env for Astro/Vite, fallback to process.env for Node.js
const getEnvVar = (key: string, defaultValue: string = '') => {
  // In server-side context (API routes), use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  // In client-side context, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

// OpenRouter configuration for Gemini 2.5 Flash
const openrouter = createOpenAI({
  apiKey: getEnvVar('OPENROUTER_API_KEY'),
  baseURL: 'https://openrouter.ai/api/v1',
});

// Gemini 2.5 Flash model configuration as specified
export const llmConfig = {
  model: openrouter(getEnvVar('DEFAULT_MODEL', 'google/gemini-2.0-flash-exp')),
  fallbackModels: [
    openrouter('anthropic/claude-3-haiku'),
    openrouter('openai/gpt-4o-mini')
  ],
  maxTokens: parseInt(getEnvVar('MAX_TOKENS', '4096')),
  temperature: parseFloat(getEnvVar('TEMPERATURE', '0.7')),
  streamingEnabled: getEnvVar('STREAMING_ENABLED', 'true') !== 'false',
};

// Environment validation
export const validateLLMConfig = () => {
  const apiKey = getEnvVar('OPENROUTER_API_KEY');
  if (!apiKey) {
    console.warn('OPENROUTER_API_KEY not found in environment variables');
    console.warn('Available env keys:', Object.keys(process.env || {}));
    return false;
  }
  console.log('API Key found:', apiKey.substring(0, 10) + '...');
  return true;
};

// Model fallback chain for error handling
export const getModelWithFallback = (attemptNumber: number = 0) => {
  const models = [llmConfig.model, ...llmConfig.fallbackModels];
  return models[Math.min(attemptNumber, models.length - 1)];
};