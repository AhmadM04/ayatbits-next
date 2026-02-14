import type { Config } from 'tailwindcss';

const config: Config = {
  // CRITICAL: Force Tailwind to use class-based dark mode
  // Without this, Tailwind ignores the "dark" class on <html>
  darkMode: 'class',
  
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      // Custom color variables from globals.css
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        // Primary sans-serif (Inter) - Used for all English/Russian text
        sans: [
          'var(--font-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'system-ui',
          'sans-serif'
        ],
        // Monospace (Geist Mono) - Code and technical content
        mono: [
          'var(--font-mono)',
          'Monaco',
          'Courier New',
          'monospace'
        ],
        // Arabic/Quranic text (Amiri Quran) - All Quranic verses
        arabic: [
          'var(--font-arabic)',
          'Amiri Quran',
          'Scheherazade New',
          'Traditional Arabic',
          'serif'
        ],
        // Uthmani Mushaf script (Local font file) - Mushaf page view
        uthmani: [
          'Uthmani',
          'var(--font-arabic)',
          'Amiri Quran',
          'serif'
        ],
      },
    },
  },
  
  plugins: [],
};

export default config;

