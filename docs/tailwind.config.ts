import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':    '#0F0F1A',
        'bg-card':       '#1A1A2E',
        'bg-card-hover': '#1e1e35',
        'accent-pink':   '#E91E8C',
        'accent-purple': '#6A0DAD',
        'text-muted':    '#888888',
        'border-subtle': 'rgba(255,255,255,0.08)',
        'success':       '#22C55E',
        'warning':       '#F59E0B',
        'error':         '#EF4444',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
