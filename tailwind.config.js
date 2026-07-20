/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c8',
          400: '#8591a8',
          500: '#67738e',
          600: '#525c75',
          700: '#434b5f',
          800: '#3a4051',
          900: '#1a1d28',
          950: '#0f1118',
        },
        gold: {
          50: '#fbf8f0',
          100: '#f5edd6',
          200: '#ebd9a8',
          300: '#dfbf76',
          400: 'var(--theme-accent, #d4a64e)',
          500: 'var(--theme-accent, #c69035)',
          600: 'var(--theme-accent, #a8722a)',
          700: '#875424',
          800: '#714322',
          900: '#5f3820',
          950: '#341d0f',
        },
        teal: {
          50: '#f0fbfa',
          100: '#d3f4f2',
          200: '#ace9e6',
          300: '#76d7d6',
          400: '#3fbfC2',
          500: '#22a3a8',
          600: '#1c8388',
          700: '#1c6a6e',
          800: '#1c5458',
          900: '#1b464a',
          950: '#0c2a2d',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
