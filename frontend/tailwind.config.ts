import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD400',
          spark:  '#FFE033',
          hover:  '#E5BE00',
          light:  '#FFF9D2',
          muted:  '#FFFDEB',
          border: '#F5C800',
          dark:   '#B39200',
        },
        obsidian: {
          DEFAULT:  '#09090B',
          card:     '#121215',
          elevated: '#18181B',
          border:   '#27272A',
          subtle:   '#3F3F46',
        },
        midnight: {
          950: '#06080F',
          900: '#0B0F19',
          800: '#121929',
          700: '#1C263D',
        },
        surface: {
          canvas:       '#FFFFFF',
          card:         '#FFFFFF',
          subtle:       '#F8F9FA',
          elevated:     '#F4F4F5',
          border:       '#E4E4E7',
          'border-dark':  '#09090B',
          'border-light': '#F4F4F5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        fintech:      '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
        card:         '0 2px 8px -2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.12)',
        'glow-gold':  '0 0 25px -4px rgba(255,212,0,0.35)',
        'glow-gold-lg':'0 0 40px -6px rgba(255,212,0,0.4)',
        'glow-emerald':'0 0 25px -4px rgba(16,185,129,0.3)',
        'inner-gold': 'inset 0 0 0 1px rgba(255,212,0,0.25)',
      },
      animation: {
        shimmer:       'shimmer 2.2s infinite linear',
        'shimmer-gold':'shimmer-gold 2.2s infinite linear',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow-pulse':  'glow-pulse 2.5s ease-in-out infinite',
        'slide-up':    'slide-up 0.25s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'shimmer-gold': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px -2px rgba(255,212,0,0.2)' },
          '50%':      { boxShadow: '0 0 28px -2px rgba(255,212,0,0.45)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
