# Local Development Setup

This guide will help you get the Qatar Stopover AI Agent running locally for development and testing.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Required for AI functionality
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # Optional - Model Configuration
   DEFAULT_MODEL=google/gemini-2.0-flash-exp
   MAX_TOKENS=4096
   TEMPERATURE=0.7
   STREAMING_ENABLED=true
   
   # Development Settings
   NODE_ENV=development
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test the Setup**
   - Visit http://localhost:4321/dev-test to verify basic functionality
   - Visit http://localhost:4321/ for the main application

## Environment Variables Explained

### Required
- `OPENROUTER_API_KEY`: Your OpenRouter API key for accessing AI models

### Optional
- `DEFAULT_MODEL`: Primary AI model to use (default: google/gemini-2.0-flash-exp)
- `MAX_TOKENS`: Maximum tokens per response (default: 4096)
- `TEMPERATURE`: AI response creativity (0-1, default: 0.7)
- `STREAMING_ENABLED`: Enable streaming responses (default: true)

## Getting an OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Go to your API Keys section
4. Create a new API key
5. Add credits to your account for API usage

## Development Features

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Test Pages
- `/dev-test` - Basic functionality test
- `/design-system` - UI component showcase
- `/chat-test` - Chat functionality test

## Troubleshooting

### Common Issues

1. **"Missing ./react specifier in ai package"**
   - Fixed by downgrading to ai@^3.3.0
   - Ensure you've run `npm install` after the fix

2. **"OPENROUTER_API_KEY not found"**
   - Create a `.env` file with your API key
   - Restart the development server

3. **Durable Objects warnings**
   - These are expected in local development
   - They won't affect local functionality
   - Will work properly when deployed to Cloudflare

4. **Sharp image service warning**
   - This is expected with Cloudflare adapter
   - Images will work in production

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| AI Models | OpenRouter API | OpenRouter API |
| Data Storage | Memory/LocalStorage | Cloudflare KV |
| Conversation State | Local only | Durable Objects |
| Image Processing | Limited | Full Sharp support |

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Chat interface appears
- [ ] Can send messages (with API key)
- [ ] Responses are received
- [ ] UI components render correctly

## Next Steps

Once local development is working:
1. Test core functionality
2. Make your changes
3. Run tests to ensure nothing breaks
4. Deploy to Cloudflare for production testing

## Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify your `.env` file is set up correctly
3. Ensure all dependencies are installed
4. Try clearing node_modules and reinstalling