import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        governance: {
          'public-bg': '#dcfce7',
          'public-text': '#166534',
          'internal-bg': '#dbeafe',
          'internal-text': '#1e40af',
          'restricted-bg': '#fee2e2',
          'restricted-text': '#991b1b',
        },
        tag: {
          'pii-bg': '#fef2f2',
          'pii-text': '#dc2626',
          'sensitive-bg': '#fff7ed',
          'sensitive-text': '#c2410c',
          'public-bg': '#f0fdf4',
          'public-text': '#16a34a',
        },
        status: {
          healthy: '#22c55e',
          degraded: '#f59e0b',
          down: '#ef4444',
        },
        difficulty: {
          'easy-bg': '#f0fdf4',
          'easy-text': '#16a34a',
          'medium-bg': '#fef9c3',
          'medium-text': '#854d0e',
          'hard-bg': '#fef2f2',
          'hard-text': '#dc2626',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
