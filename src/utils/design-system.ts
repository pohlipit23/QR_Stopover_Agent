// Qatar Airways Design System Utilities

import designSystemData from '@/data/design_system.json';
import type { QatarDesignSystem } from '@/types/design-system';

// Export the design system data with proper typing
export const designSystem = designSystemData as unknown as QatarDesignSystem;

// Utility functions for accessing design tokens
export const colors = designSystem.colors;
export const typography = designSystem.typography;
export const spacing = designSystem.spacing;
export const borderRadius = designSystem.borderRadius;
export const shadows = designSystem.shadows;
export const breakpoints = designSystem.breakpoints;
export const components = designSystem.components;
export const animations = designSystem.animations;
export const accessibility = designSystem.accessibility;

// Color utility functions
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found in design system`);
      return '#000000'; // fallback color
    }
  }
  
  return value;
};

// Spacing utility functions
export const getSpacing = (key: keyof typeof spacing.scale): string => {
  return spacing.scale[key];
};

// Typography utility functions
export const getFontFamily = (type: 'primary' | 'fallback' = 'primary'): string => {
  return typography.fontFamily[type].join(', ');
};

export const getHeadingStyle = (level: 'h1' | 'h2' | 'h3') => {
  return typography.headings[level];
};

// Component style generators
export const getButtonClass = (variant: 'primary' | 'secondary' | 'ghost'): string => {
  return `btn btn-${variant}`;
};

export const getCardClass = (interactive: boolean = false): string => {
  return interactive ? 'card card-interactive' : 'card';
};

export const getInputClass = (hasError: boolean = false): string => {
  return hasError ? 'input error' : 'input';
};

export const getTabClass = (isActive: boolean = false): string => {
  return isActive ? 'tab active' : 'tab';
};

export const getMessageBubbleClass = (sender: 'agent' | 'user'): string => {
  return `message-bubble ${sender}`;
};

// Responsive utilities
export const getBreakpoint = (size: keyof typeof breakpoints): string => {
  return breakpoints[size];
};

export const isBreakpoint = (currentWidth: number, breakpoint: keyof typeof breakpoints): boolean => {
  const breakpointValue = parseInt(breakpoints[breakpoint]);
  
  switch (breakpoint) {
    case 'mobile':
      return currentWidth < parseInt(breakpoints.tablet);
    case 'tablet':
      return currentWidth >= parseInt(breakpoints.tablet) && currentWidth < parseInt(breakpoints.desktop);
    case 'desktop':
      return currentWidth >= parseInt(breakpoints.desktop) && currentWidth < parseInt(breakpoints.largeDesktop);
    case 'largeDesktop':
      return currentWidth >= parseInt(breakpoints.largeDesktop);
    default:
      return false;
  }
};

// CSS custom properties generator for runtime theming
export const generateCSSCustomProperties = (): Record<string, string> => {
  return {
    // Colors
    '--color-primary-burgundy': colors.primary.burgundy,
    '--color-secondary-oneworld': colors.secondary.oneworldBlue,
    '--color-neutral-grey1': colors.neutral.grey1,
    '--color-neutral-grey2': colors.neutral.grey2,
    '--color-neutral-grey3': colors.neutral.grey3,
    '--color-neutral-light': colors.neutral.lightGrey,
    '--color-neutral-white': colors.neutral.white,
    '--color-neutral-black': colors.neutral.black,
    '--color-accent-red': colors.accent.red,
    
    // Typography
    '--font-primary': typography.fontFamily.primary.join(', '),
    '--font-fallback': typography.fontFamily.fallback.join(', '),
    '--font-size-base': typography.baseFontSize,
    '--font-size-h1': typography.headings.h1.fontSize,
    '--font-size-h2': typography.headings.h2.fontSize,
    '--font-size-h3': typography.headings.h3.fontSize,
    
    // Spacing
    '--spacing-xs': spacing.scale.xs,
    '--spacing-sm': spacing.scale.sm,
    '--spacing-md': spacing.scale.md,
    '--spacing-lg': spacing.scale.lg,
    '--spacing-xl': spacing.scale.xl,
    '--spacing-xxl': spacing.scale.xxl,
    
    // Border Radius
    '--radius-sm': borderRadius.sm,
    '--radius-md': borderRadius.md,
    '--radius-lg': borderRadius.lg,
    '--radius-full': borderRadius.full,
    
    // Shadows
    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    
    // Transitions
    '--transition-fast': animations.transitions.fast,
    '--transition-normal': animations.transitions.normal,
    '--transition-slow': animations.transitions.slow,
    
    // Container
    '--container-max-width': designSystem.container.maxWidth,
    '--container-padding': designSystem.container.padding,
  };
};

// Tailwind CSS class generators
export const tw = {
  // Color classes
  colors: {
    primary: 'text-primary-burgundy',
    secondary: 'text-secondary-oneworld',
    neutral: {
      grey1: 'text-neutral-grey1',
      grey2: 'text-neutral-grey2',
      grey3: 'text-neutral-grey3',
      light: 'text-neutral-light',
      white: 'text-neutral-white',
      black: 'text-neutral-black',
    },
    accent: 'text-accent-red',
  },
  
  // Background color classes
  bg: {
    primary: 'bg-primary-burgundy',
    secondary: 'bg-secondary-oneworld',
    neutral: {
      grey1: 'bg-neutral-grey1',
      grey2: 'bg-neutral-grey2',
      grey3: 'bg-neutral-grey3',
      light: 'bg-neutral-light',
      white: 'bg-neutral-white',
      black: 'bg-neutral-black',
    },
    accent: 'bg-accent-red',
  },
  
  // Spacing classes
  spacing: {
    xs: 'p-xs m-xs',
    sm: 'p-sm m-sm',
    md: 'p-md m-md',
    lg: 'p-lg m-lg',
    xl: 'p-xl m-xl',
    xxl: 'p-xxl m-xxl',
  },
  
  // Typography classes
  text: {
    h1: 'text-h1 font-bold text-primary-burgundy',
    h2: 'text-h2 font-medium text-neutral-grey2',
    h3: 'text-h3 font-medium text-neutral-grey2',
    body: 'text-base font-normal text-neutral-grey2',
  },
  
  // Border radius classes
  rounded: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  },
  
  // Shadow classes
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
};

// Validation functions
export const validateDesignSystem = (): boolean => {
  try {
    // Check required properties exist
    const requiredProps = ['colors', 'typography', 'spacing', 'components'];
    for (const prop of requiredProps) {
      if (!(prop in designSystem)) {
        console.error(`Missing required design system property: ${prop}`);
        return false;
      }
    }
    
    // Check color values are valid hex codes
    const colorValues = [
      colors.primary.burgundy,
      colors.secondary.oneworldBlue,
      colors.neutral.grey1,
      colors.neutral.grey2,
      colors.neutral.grey3,
      colors.accent.red,
    ];
    
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const color of colorValues) {
      if (!hexColorRegex.test(color)) {
        console.error(`Invalid hex color value: ${color}`);
        return false;
      }
    }
    
    console.log('Design system validation passed');
    return true;
  } catch (error) {
    console.error('Design system validation failed:', error);
    return false;
  }
};

// Initialize design system validation on import
if (typeof window !== 'undefined') {
  validateDesignSystem();
}

export default designSystem;