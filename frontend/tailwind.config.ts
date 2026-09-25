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
          hover: '#E5BE00',
          light: '#FFF9D2',
          muted: '#FFFDEB',
          border: '#F5C800',
          dark: '#B39200',
        },
        obsidian: {
          DEFAULT: '#09090B',
          card: '#121215',
          elevated: '#18181B',
          border: '#27272A',
          subtle: '#3F3F46',
        },
        midnight: {
          950: '#06080F',
          900: '#0B0F19',
          800: '#121929',
          700: '#1C263D',
        },
        surface: {
          canvas: '#FFFFFF',
          card: '#FFFFFF',
          subtle: '#F8F9FA',
          elevated: '#F4F4F5',
          border: '#E4E4E7',
          'border-dark': '#09090B',
          'border-light': '#F4F4F5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        fintech: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.12)',
        'glow-gold': '0 0 25px -4px rgba(255, 212, 0, 0.35)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
