import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Simple system prompt
const SYSTEM_PROMPT = `You are a Qatar Airways stopover booking assistant. Help customers add stopover packages in Doha to their existing flight bookings. 

CRITICAL: Keep ALL responses under 2 sentences. Be direct and concise.

If asked about anything not related to Qatar Airways stopover packages, respond exactly: "I only chat about QRH Stopover Packages"`;

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin') || '';
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin.includes('localhost') ? origin : 'http://localhost:4323',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if API key is available
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'API key not configured',
        debug: 'OPENROUTER_API_KEY environment variable is missing'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({
        error: 'Invalid messages format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Create OpenRouter client
    const openrouter = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // Use model from environment variables
    const modelName = process.env.DEFAULT_MODEL || 'google/gemini-2.0-flash-exp';
    const model = openrouter(modelName);

    console.log('Making LLM request with messages:', messages.length);
    console.log('Using API key:', apiKey.substring(0, 20) + '...');
    console.log('Using model:', modelName);

    const result = await streamText({
      model,
      messages,
      system: SYSTEM_PROMPT,
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.MAX_TOKENS || '1000'),
    });

    console.log('LLM request successful, creating stream response');

    // Create streaming response compatible with useChat hook
    const response = result.toDataStreamResponse();
    
    // Add CORS headers
    const origin = request.headers.get('origin') || '';
    response.headers.set('Access-Control-Allow-Origin', origin.includes('localhost') ? origin : 'http://localhost:4323');
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('Connection', 'keep-alive');
    
    return response;

  } catch (error: any) {
    console.error('Chat API error:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      type: error.name || 'UnknownError'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};