import designSystem from './src/data/design_system.json';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          burgundy: designSystem.colors.primary.burgundy,
        },
        secondary: {
          oneworld: designSystem.colors.secondary.oneworldBlue,
        },
        neutral: {
          grey1: designSystem.colors.neutral.grey1,
          grey2: designSystem.colors.neutral.grey2,
          grey3: designSystem.colors.neutral.grey3,
          light: designSystem.colors.neutral.lightGrey,
          lightGrey: designSystem.colors.neutral.lightGrey,
          white: designSystem.colors.neutral.white,
          black: designSystem.colors.neutral.black,
        },
        accent: {
          red: designSystem.colors.accent.red,
        },
      },
      fontFamily: {
        primary: ['Jotia', 'Arial', 'sans-serif'],
        fallback: ['Arial', 'sans-serif'],
        jotia: ['Jotia', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'h1': designSystem.typography.headings.h1.fontSize,
        'h2': designSystem.typography.headings.h2.fontSize,
        'h3': designSystem.typography.headings.h3.fontSize,
      },
      spacing: {
        'xs': designSystem.spacing.scale.xs,
        'sm': designSystem.spacing.scale.sm,
        'md': designSystem.spacing.scale.md,
        'lg': designSystem.spacing.scale.lg,
        'xl': designSystem.spacing.scale.xl,
        'xxl': designSystem.spacing.scale.xxl,
      },
      borderRadius: {
        'sm': designSystem.borderRadius.sm,
        'md': designSystem.borderRadius.md,
        'lg': designSystem.borderRadius.lg,
      },
      boxShadow: {
        'sm': designSystem.shadows.sm,
        'md': designSystem.shadows.md,
        'lg': designSystem.shadows.lg,
      },
      screens: {
        'mobile': designSystem.breakpoints.mobile,
        'tablet': designSystem.breakpoints.tablet,
        'desktop': designSystem.breakpoints.desktop,
        'large-desktop': designSystem.breakpoints.largeDesktop,
      },
      maxWidth: {
        'container': designSystem.container.maxWidth,
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
      },
      ringWidth: {
        '3': '3px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};