# Qatar Airways Stopover AI Agent

A high-fidelity, interactive web application that enables existing Qatar Airways customers to add stopover packages in Doha to their flight itineraries through a conversational AI interface.

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── pages/              # Astro pages for routing
│   ├── types/              # TypeScript type definitions
│   ├── data/               # Static data and design system
│   ├── utils/              # Utility functions
│   ├── assets/             # Static assets
│   │   └── images/         # Image assets
│   ├── styles/             # Global CSS styles
│   └── api/                # Hono API routes
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── wrangler.toml           # Cloudflare Workers configuration
└── package.json            # Dependencies and scripts
```

## Technology Stack

- **Frontend**: Astro with React integration
- **Styling**: Tailwind CSS with Qatar Airways design tokens
- **Backend**: Hono on Cloudflare Workers
- **Deployment**: Cloudflare Pages
- **Language**: TypeScript

## Qatar Airways Design System

The application strictly adheres to the Qatar Airways Digital Design System with:

- **Colors**: Burgundy primary (#662046), Oneworld Blue (#120C80)
- **Typography**: Jotia font family with Arial fallback
- **Spacing**: 8px base unit system
- **Components**: Standardized buttons, cards, inputs, and tabs

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The application is configured for deployment on Cloudflare Pages with:
- Automatic builds from Git repository
- Cloudflare Workers for API endpoints
- Global edge distribution
- Built-in CI/CD pipeline

## Features

- Multi-modal chat interface (text, voice, buttons)
- Responsive design for all devices
- Qatar Airways brand compliance
- Cloudflare edge optimization
- TypeScript type safety
- Modern React components with Astro SSR