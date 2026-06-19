/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        navy: {
          50: '#F0F4FA',
          100: '#D6E0F0',
          200: '#ADC1E0',
          300: '#84A2D1',
          400: '#5B83C1',
          500: '#3264B1',
          600: '#28508E',
          700: '#1E3C6A',
          800: '#142847',
          900: '#0A2540',
          950: '#061525',
        },
        brand: {
          gold: '#C9A962',
          goldLight: '#DDBE7C',
          goldDark: '#B8963E',
        },
        risk: {
          critical: '#DC2626',
          criticalLight: '#FEE2E2',
          warning: '#D97706',
          warningLight: '#FEF3C7',
          safe: '#059669',
          safeLight: '#D1FAE5',
        }
      },
      fontFamily: {
        sans: ['"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Source Han Serif SC"', '"Noto Serif SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 24px -8px rgba(10, 37, 64, 0.12)',
        'card-hover': '0 12px 40px -12px rgba(10, 37, 64, 0.25)',
        'glow-red': '0 0 32px rgba(220, 38, 38, 0.25)',
        'glow-amber': '0 0 32px rgba(217, 119, 6, 0.25)',
        'glow-green': '0 0 32px rgba(5, 150, 105, 0.25)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '70%': { transform: 'translateX(-2px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
