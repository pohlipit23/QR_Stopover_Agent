import type { APIRoute } from 'astro';
import dotenv from 'dotenv';

// Load environment variables explicitly
dotenv.config();

export const GET: APIRoute = async ({ request }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  return new Response(
    JSON.stringify({
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) || 'none',
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENROUTER') || key.includes('DEFAULT_MODEL'))
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};