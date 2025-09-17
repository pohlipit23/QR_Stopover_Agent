import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const POST: APIRoute = async ({ request }) => {
    try {
        console.log('Chat API called');

        // Check if API key exists
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('No API key found');
            return new Response(
                JSON.stringify({
                    error: 'API key not configured',
                    debug: 'OPENROUTER_API_KEY missing'
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        console.log('API key found:', apiKey.substring(0, 10) + '...');

        // Parse request
        const { messages } = await request.json();
        console.log('Messages received:', messages?.length || 0);

        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: 'Invalid messages format' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Create OpenRouter client
        const openrouter = createOpenAI({
            apiKey,
            baseURL: 'https://openrouter.ai/api/v1',
        });

        const model = openrouter('google/gemini-2.5-flash');

        console.log('Calling LLM...');

        // Call the LLM
        const result = await streamText({
            model,
            messages,
            system: `You are a Qatar Airways stopover booking assistant. Help customers add stopover packages in Doha to their existing flight bookings. Be friendly and helpful.`,
            temperature: 0.7,
        });

        console.log('LLM call successful');

        return result.toDataStreamResponse();

    } catch (error: any) {
        console.error('Chat API error:', error);

        return new Response(
            JSON.stringify({
                error: 'An unexpected error occurred',
                type: error.name || 'UnknownError',
                message: error.message,
                retryable: true
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};