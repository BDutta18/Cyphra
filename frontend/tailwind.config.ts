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
          hover: '#E6BF00',
          light: '#FFF9D2',
          muted: '#FFFDEB',
          border: '#F5C800',
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
    },
  },
  plugins: [],
};

export default config;
