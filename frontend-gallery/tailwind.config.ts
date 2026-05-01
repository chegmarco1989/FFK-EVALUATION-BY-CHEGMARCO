/**
 * =============================================================================
 * TAILWIND CSS CONFIGURATION
 * =============================================================================
 * Custom design system with colors, typography, animations, and utilities.
 * This creates a cohesive, premium design language across the application.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      /* Custom color palette - Premium design system */
      colors: {
        /* Primary brand colors */
        primary: {
          50: '#FFF8F0',
          100: '#FFEFD9',
          200: '#FFD9A8',
          300: '#FFC277',
          400: '#FFAB46',
          500: '#F5A623', // Main brand color
          600: '#D98E1A',
          700: '#B37615',
          800: '#8C5E11',
          900: '#66460C',
        },

        /* Neutral colors - Beige/Cream palette for light mode */
        neutral: {
          50: '#FAFAF9',
          100: '#F5F0E8', // Main background
          200: '#EBE4D8',
          300: '#D9CFC0',
          400: '#C7BAA8',
          500: '#B5A590',
          600: '#9A8A75',
          700: '#7F6F5A',
          800: '#64543F',
          900: '#493924',
        },

        /* Dark mode colors - True black/gray palette */
        dark: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712', // Almost pure black
        },

        /* Semantic colors - using standard Tailwind names */
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
      },

      /* Custom font families */
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },

      /* Custom spacing */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      /* Custom animations */
      animation: {
        /* Fade in animation */
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',

        /* Slide animations */
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',

        /* Scale animations */
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',

        /* Shake animation for errors */
        'shake': 'shake 0.5s ease-in-out',

        /* Shimmer effect for skeleton loaders */
        'shimmer': 'shimmer 2s infinite',

        /* Pulse animation */
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        /* Bounce animation */
        'bounce-slow': 'bounce 2s infinite',

        /* Spin animation */
        'spin-slow': 'spin 3s linear infinite',

        /* Heart pop animation for likes */
        'heart-pop': 'heartPop 0.5s ease-out',
      },

      /* Keyframes for custom animations */
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },

      /* Custom box shadows */
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(245, 166, 35, 0.3)',
      },

      /* Custom border radius */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      /* Custom backdrop blur */
      backdropBlur: {
        xs: '2px',
      },

      /* Custom transitions */
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
};

export default config;
