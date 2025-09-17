// Simple script to test environment variable loading
import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables loaded:');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Found (' + process.env.OPENROUTER_API_KEY.substring(0, 10) + '...)' : 'Not found');
console.log('DEFAULT_MODEL:', process.env.DEFAULT_MODEL || 'Not found');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not found');
console.log('All env keys containing OPENROUTER:', Object.keys(process.env).filter(key => key.includes('OPENROUTER')));