/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warm: {
          50:  '#faf8f4',
          100: '#f5f1eb',
          200: '#ede9e2',
          300: '#e4ded5',
          400: '#d6cfc5',
          500: '#c0b8ac',
        },
        // keep cream for backwards compat
        cream: {
          50:  '#faf8f4',
          100: '#f5f1eb',
          200: '#ede9e2',
        },
        // dark mode fallback (ink)
        ink: {
          950: '#080810',
          900: '#0f0f1a',
          800: '#141420',
          700: '#1a1a2e',
          600: '#22223b',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif'],
      },
      animation: {
        skeleton: 'skeleton 1.4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out both',
        'heart-pop': 'heartPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up': 'slideUp 0.35s ease-out both',
      },
      keyframes: {
        skeleton: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '0.75' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.45)' },
          '100%': { transform: 'scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.88)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34,1.56,0.64,1)',
      }
    },
  },
  plugins: [],
}
