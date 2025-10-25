import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          50: '#0b0f1a',
          100: '#0f172a',
          500: '#1e3a8a',
          600: '#1d4ed8',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['"Rajdhani"', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 10px rgba(14, 165, 233, 0.6)'
      }
    }
  },
  plugins: []
};

export default config;
