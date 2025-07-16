import { Hono } from 'hono';

// Basic Hono app setup for Cloudflare Workers
const app = new Hono();

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Qatar Airways Stopover AI Agent API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic conversation endpoint placeholder
app.post('/api/conversation', async (c) => {
  const body = await c.req.json();
  
  return c.json({
    message: 'Conversation endpoint ready',
    received: body,
    timestamp: new Date().toISOString()
  });
});

export default app;