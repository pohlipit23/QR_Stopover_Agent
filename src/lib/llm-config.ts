import { createOpenAI } from '@ai-sdk/openai';

// OpenRouter configuration for Gemini 2.5 Flash
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
});

// Gemini 2.5 Flash model configuration as specified
export const llmConfig = {
  model: openrouter(process.env.DEFAULT_MODEL || 'google/gemini-2.0-flash-exp'),
  fallbackModels: [
    openrouter('anthropic/claude-3-haiku'),
    openrouter('openai/gpt-4o-mini')
  ],
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
  streamingEnabled: process.env.STREAMING_ENABLED !== 'false',
};

// Environment validation
export const validateLLMConfig = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('OPENROUTER_API_KEY not found in environment variables');
    return false;
  }
  return true;
};

// Model fallback chain for error handling
export const getModelWithFallback = (attemptNumber: number = 0) => {
  const models = [llmConfig.model, ...llmConfig.fallbackModels];
  return models[Math.min(attemptNumber, models.length - 1)];
};