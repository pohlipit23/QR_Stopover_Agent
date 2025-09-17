import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import { loadEnv } from 'vite';

// Load environment variables
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  vite: {
    define: {
      // Make environment variables available to the server
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
      'process.env.DEFAULT_MODEL': JSON.stringify(env.DEFAULT_MODEL),
      'process.env.MAX_TOKENS': JSON.stringify(env.MAX_TOKENS),
      'process.env.TEMPERATURE': JSON.stringify(env.TEMPERATURE),
      'process.env.STREAMING_ENABLED': JSON.stringify(env.STREAMING_ENABLED),
    },
    resolve: {
      alias: {
        '@': '/src',
        '@/components': '/src/components',
        '@/types': '/src/types',
        '@/data': '/src/data',
        '@/utils': '/src/utils',
        '@/assets': '/src/assets'
      }
    }
  }
});