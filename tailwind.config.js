/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vintage: {
          bg: '#0f0f1a',
          surface: '#1a1a2e',
          border: '#2d2d44',
          text: '#e8dcc8',
          muted: '#8a8575',
          accent: '#c4a43e',
          danger: '#8b3a3a',
        },
      },
      fontFamily: {
        mono: ['"Courier Prime"', 'Courier New', 'monospace'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'shutter-flash': 'shutterFlash 0.4s ease-out',
        'film-advance': 'filmAdvance 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        shutterFlash: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        filmAdvance: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-8px)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(196, 164, 62, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(196, 164, 62, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};