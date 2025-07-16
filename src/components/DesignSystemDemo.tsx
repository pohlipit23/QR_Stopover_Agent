// Design System Demo Component - For testing and showcasing Qatar Airways design system

import React from 'react';
import { designSystem } from '@/utils/design-system';

export const DesignSystemDemo: React.FC = () => {
  return (
    <div className="container py-xxl space-y-xxl">
      {/* Typography Section */}
      <section className="space-y-lg">
        <h1>Qatar Airways Design System</h1>
        <h2>Typography Showcase</h2>
        <div className="space-y-md">
          <h1>Heading 1 - Qatar Airways Stopover</h1>
          <h2>Heading 2 - Discover Doha</h2>
          <h3>Heading 3 - Premium Experience</h3>
          <p className="text-base text-neutral-grey2">
            Body text - Experience the best of Doha with our premium stopover packages. 
            From luxury hotels to exciting tours, we have everything you need for an unforgettable journey.
          </p>
          <a href="#" className="text-primary-burgundy font-medium">
            Link example - Learn more about our services
          </a>
        </div>
      </section>

      {/* Color Palette Section */}
      <section className="space-y-lg">
        <h2>Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div className="space-y-sm">
            <div className="w-full h-16 bg-primary-burgundy rounded-md"></div>
            <p className="text-sm font-medium">Primary Burgundy</p>
            <p className="text-xs text-neutral-grey1">{designSystem.colors.primary.burgundy}</p>
          </div>
          <div className="space-y-sm">
            <div className="w-full h-16 bg-secondary-oneworld rounded-md"></div>
            <p className="text-sm font-medium">Oneworld Blue</p>
            <p className="text-xs text-neutral-grey1">{designSystem.colors.secondary.oneworldBlue}</p>
          </div>
          <div className="space-y-sm">
            <div className="w-full h-16 bg-accent-red rounded-md"></div>
            <p className="text-sm font-medium">Accent Red</p>
            <p className="text-xs text-neutral-grey1">{designSystem.colors.accent.red}</p>
          </div>
          <div className="space-y-sm">
            <div className="w-full h-16 bg-neutral-light rounded-md border border-neutral-grey1"></div>
            <p className="text-sm font-medium">Light Grey</p>
            <p className="text-xs text-neutral-grey1">{designSystem.colors.neutral.lightGrey}</p>
          </div>
        </div>
      </section>

      {/* Button Components Section */}
      <section className="space-y-lg">
        <h2>Button Components</h2>
        <div className="flex flex-wrap gap-md">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-ghost">Ghost Button</button>
          <button className="btn btn-primary" disabled>Disabled Button</button>
        </div>
        
        <div className="space-y-sm">
          <h3>Button States</h3>
          <div className="flex flex-wrap gap-md">
            <button className="btn btn-primary hover:bg-opacity-90">Hover State</button>
            <button className="btn btn-secondary focus:ring-2 focus:ring-primary-burgundy focus:ring-opacity-30">Focus State</button>
          </div>
        </div>
      </section>

      {/* Card Components Section */}
      <section className="space-y-lg">
        <h2>Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          <div className="card">
            <h3 className="mb-md">Standard Card</h3>
            <p className="text-neutral-grey2 mb-md">
              This is a standard card component with default styling and hover effects.
            </p>
            <button className="btn btn-primary">Action Button</button>
          </div>
          
          <div className="card card-interactive">
            <h3 className="mb-md">Interactive Card</h3>
            <p className="text-neutral-grey2 mb-md">
              This card is interactive and can be clicked. It has hover and selection states.
            </p>
            <div className="text-sm text-neutral-grey1">Click to select</div>
          </div>
          
          <div className="card card-interactive selected">
            <h3 className="mb-md">Selected Card</h3>
            <p className="text-neutral-grey2 mb-md">
              This card is in the selected state with burgundy border.
            </p>
            <div className="text-sm text-primary-burgundy font-medium">Selected</div>
          </div>
        </div>
      </section>

      {/* Input Components Section */}
      <section className="space-y-lg">
        <h2>Input Components</h2>
        <div className="max-w-md space-y-md">
          <div>
            <label className="block text-sm font-medium text-neutral-grey2 mb-sm">
              Standard Input
            </label>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter your text here"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-grey2 mb-sm">
              Input with Error
            </label>
            <input 
              type="email" 
              className="input error" 
              placeholder="invalid-email"
            />
            <p className="text-sm text-accent-red mt-sm">Please enter a valid email address</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-grey2 mb-sm">
              Disabled Input
            </label>
            <input 
              type="text" 
              className="input" 
              placeholder="Disabled input"
              disabled
            />
          </div>
        </div>
      </section>

      {/* Tab Components Section */}
      <section className="space-y-lg">
        <h2>Tab Components</h2>
        <div className="tabs">
          <a href="#" className="tab active">Active Tab</a>
          <a href="#" className="tab">Inactive Tab</a>
          <a href="#" className="tab">Another Tab</a>
        </div>
        <div className="p-lg bg-neutral-light rounded-md">
          <p>Tab content area - This is where the content for the active tab would be displayed.</p>
        </div>
      </section>

      {/* Message Bubble Components Section */}
      <section className="space-y-lg">
        <h2>Message Bubble Components</h2>
        <div className="max-w-2xl space-y-md">
          <div className="flex">
            <div className="message-bubble agent">
              Hello! I'm your Qatar Airways assistant. How can I help you with your stopover in Doha today?
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="message-bubble user">
              I'd like to add a stopover package to my existing booking.
            </div>
          </div>
          
          <div className="flex">
            <div className="message-bubble agent">
              Perfect! I can help you with that. Let me show you our available stopover categories.
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Reply Components Section */}
      <section className="space-y-lg">
        <h2>Suggested Reply Components</h2>
        <div className="space-y-md">
          <p className="text-neutral-grey2">Choose from these suggested replies:</p>
          <div className="flex flex-wrap">
            <button className="suggested-reply">Yes, I'm interested</button>
            <button className="suggested-reply">Tell me more</button>
            <button className="suggested-reply">Show me options</button>
            <button className="suggested-reply">Not right now</button>
          </div>
        </div>
      </section>

      {/* Spacing and Layout Section */}
      <section className="space-y-lg">
        <h2>Spacing System</h2>
        <div className="space-y-md">
          <div className="flex items-center space-x-md">
            <div className="w-4 h-4 bg-primary-burgundy"></div>
            <span className="text-sm">XS - {designSystem.spacing.scale.xs}</span>
          </div>
          <div className="flex items-center space-x-md">
            <div className="w-8 h-8 bg-primary-burgundy"></div>
            <span className="text-sm">SM - {designSystem.spacing.scale.sm}</span>
          </div>
          <div className="flex items-center space-x-md">
            <div className="w-16 h-16 bg-primary-burgundy"></div>
            <span className="text-sm">MD - {designSystem.spacing.scale.md}</span>
          </div>
          <div className="flex items-center space-x-md">
            <div className="w-24 h-24 bg-primary-burgundy"></div>
            <span className="text-sm">LG - {designSystem.spacing.scale.lg}</span>
          </div>
        </div>
      </section>

      {/* Shadow Examples Section */}
      <section className="space-y-lg">
        <h2>Shadow System</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="p-lg bg-neutral-white rounded-md shadow-sm">
            <h4 className="font-medium mb-sm">Small Shadow</h4>
            <p className="text-sm text-neutral-grey2">Subtle shadow for minimal elevation</p>
          </div>
          <div className="p-lg bg-neutral-white rounded-md shadow-md">
            <h4 className="font-medium mb-sm">Medium Shadow</h4>
            <p className="text-sm text-neutral-grey2">Standard shadow for cards and modals</p>
          </div>
          <div className="p-lg bg-neutral-white rounded-md shadow-lg">
            <h4 className="font-medium mb-sm">Large Shadow</h4>
            <p className="text-sm text-neutral-grey2">Prominent shadow for floating elements</p>
          </div>
        </div>
      </section>

      {/* Responsive Breakpoints Section */}
      <section className="space-y-lg">
        <h2>Responsive Breakpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="p-md bg-neutral-light rounded-md">
            <h4 className="font-medium text-sm">Mobile</h4>
            <p className="text-xs text-neutral-grey2">{designSystem.breakpoints.mobile}</p>
          </div>
          <div className="p-md bg-neutral-light rounded-md">
            <h4 className="font-medium text-sm">Tablet</h4>
            <p className="text-xs text-neutral-grey2">{designSystem.breakpoints.tablet}</p>
          </div>
          <div className="p-md bg-neutral-light rounded-md">
            <h4 className="font-medium text-sm">Desktop</h4>
            <p className="text-xs text-neutral-grey2">{designSystem.breakpoints.desktop}</p>
          </div>
          <div className="p-md bg-neutral-light rounded-md">
            <h4 className="font-medium text-sm">Large Desktop</h4>
            <p className="text-xs text-neutral-grey2">{designSystem.breakpoints.largeDesktop}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemDemo;