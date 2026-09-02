/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vintage: {
          bg: 'var(--color-bg, #1A180E)',
          surface: 'var(--color-surface, #2C2818)',
          border: 'var(--color-border, #4A4028)',
          text: 'var(--color-text, #F5ECD7)',
          muted: 'var(--color-muted, #A89570)',
          accent: 'var(--color-accent, #E5B84C)',
          'accent-content': 'var(--color-accentContent, #1A180E)',
          danger: 'var(--color-danger, #D64045)',
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
          '0%, 100%': { boxShadow: '0 0 8px rgba(var(--color-accent-rgb, 229, 184, 76), 0.5)' },
          '50%': { boxShadow: '0 0 24px rgba(var(--color-accent-rgb, 229, 184, 76), 0.9)' },
        },
      },
    },
  },
  plugins: [],
};