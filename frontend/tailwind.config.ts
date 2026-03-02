import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#1a1a1e',
          secondary: '#222226',
          tertiary: '#2a2a2f',
          sidebar: '#0f0f12',
        },
        border: {
          primary: '#333338',
          secondary: '#2a2a2f',
        },
        content: {
          primary: '#ececec',
          secondary: '#a0a0a8',
          tertiary: '#7a7a84',
        },
        accent: {
          DEFAULT: '#d4a574',
          hover: '#e0b88a',
          muted: 'rgba(212,165,116,0.15)',
        },
        governance: {
          'public-bg': 'rgba(34,197,94,0.15)',
          'public-text': '#4ade80',
          'internal-bg': 'rgba(59,130,246,0.15)',
          'internal-text': '#60a5fa',
          'restricted-bg': 'rgba(239,68,68,0.15)',
          'restricted-text': '#f87171',
        },
        tag: {
          'pii-bg': 'rgba(239,68,68,0.15)',
          'pii-text': '#f87171',
          'sensitive-bg': 'rgba(249,115,22,0.15)',
          'sensitive-text': '#fb923c',
          'public-bg': 'rgba(34,197,94,0.15)',
          'public-text': '#4ade80',
        },
        status: {
          healthy: '#4ade80',
          degraded: '#fbbf24',
          down: '#f87171',
        },
        difficulty: {
          'easy-bg': 'rgba(34,197,94,0.15)',
          'easy-text': '#4ade80',
          'medium-bg': 'rgba(234,179,8,0.15)',
          'medium-text': '#facc15',
          'hard-bg': 'rgba(239,68,68,0.15)',
          'hard-text': '#f87171',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
