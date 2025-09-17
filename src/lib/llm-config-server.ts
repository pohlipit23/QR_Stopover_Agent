import { createOpenAI } from '@ai-sdk/openai';

// Server-side LLM configuration (for API routes only)
// This should only be used in server-side contexts where process.env is available

export const createLLMConfig = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  // OpenRouter configuration for Gemini 2.5 Flash
  const openrouter = createOpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  });

  return {
    model: openrouter(process.env.DEFAULT_MODEL || 'google/gemini-2.5-flash'),
    fallbackModels: [
      openrouter('anthropic/claude-3-haiku'),
      openrouter('openai/gpt-4o-mini')
    ],
    maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
    temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    streamingEnabled: process.env.STREAMING_ENABLED !== 'false',
  };
};

// Environment validation for server-side
export const validateServerLLMConfig = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not found in environment variables');
    console.error('Available env keys:', Object.keys(process.env));
    return false;
  }
  console.log('API Key found:', apiKey.substring(0, 10) + '...');
  return true;
};

// Model fallback chain for error handling
export const getModelWithFallback = (attemptNumber: number = 0) => {
  const config = createLLMConfig();
  const models = [config.model, ...config.fallbackModels];
  return models[Math.min(attemptNumber, models.length - 1)];
};